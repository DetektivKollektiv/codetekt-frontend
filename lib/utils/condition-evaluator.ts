import { ReviewTemplate } from '../queries/getReviewTemplate';
import { Condition } from '../schemas/condition-schemas';
import { Field } from '../schemas/field-schemas';

type ConditionValue = string | number | boolean;

interface ConditionContext {
  category?: ConditionValue | ConditionValue[] | null;
}

/**
 * Creates a map of all fields from a review template for efficient lookups
 */
export function createFieldsMap(
  template: NonNullable<ReviewTemplate>,
): Map<string, Field> {
  const map = new Map<string, Field>();
  template.forEach((question) => {
    question.fields.forEach((field) => {
      map.set(field.id, field);
    });
  });
  return map;
}

/**
 * Evaluates a single condition based on field values
 */
export function evaluateCondition(
  condition: Condition,
  fieldsMap: Map<string, Field>,
  context: ConditionContext = {},
): boolean {
  let fieldValue: unknown;

  if ('context' in condition && condition.context === 'category') {
    fieldValue = context.category;
  } else if ('field_id' in condition) {
    const field = fieldsMap.get(condition.field_id);
    if (!field) {
      // Field not found, condition cannot be evaluated - default to false
      return false;
    }
    fieldValue = field.answer_value;
  } else {
    return false;
  }

  if (condition.operator === '>') {
    if (typeof fieldValue !== 'number') return false;
    return fieldValue > condition.value;
  }

  if (condition.operator === '<') {
    if (typeof fieldValue !== 'number') return false;
    return fieldValue < condition.value;
  }

  if (condition.operator === '===') {
    return fieldValue === condition.value;
  }

  if (condition.operator === 'in') {
    if (fieldValue === null || fieldValue === undefined) return false;
    // Handle array values (for chip fields)
    if (Array.isArray(fieldValue)) {
      return fieldValue.some((val) => condition.values.includes(val));
    }
    // Handle single values
    return condition.values.includes(fieldValue as string | number | boolean);
  }

  return false;
}

/**
 * Evaluates an array of conditions (ANY must be true - OR logic)
 */
export function evaluateConditions(
  conditions: Condition[],
  fieldsMap: Map<string, Field>,
  context: ConditionContext = {},
): boolean {
  if (conditions.length === 0) return true;
  return conditions.some((condition) =>
    evaluateCondition(condition, fieldsMap, context),
  );
}

/**
 * Resolves a conditional property to a boolean
 */
export function resolveConditionalProperty(
  property: boolean | Condition[] | undefined,
  fieldsMap: Map<string, Field>,
  context: ConditionContext = {},
  defaultValue = false,
): boolean {
  if (property === undefined) return defaultValue;
  if (typeof property === 'boolean') return property;
  return evaluateConditions(property, fieldsMap, context);
}

/**
 * Resolves all conditional properties in a review template to booleans
 */
export function resolveReviewTemplateConditions(
  template: NonNullable<ReviewTemplate>,
  category?: ConditionValue | ConditionValue[] | null,
): NonNullable<ReviewTemplate> {
  const fieldsMap = createFieldsMap(template);
  const context: ConditionContext = { category };

  return template.map((question) => ({
    ...question,
    fields: question.fields.map((field) => ({
      ...field,
      is_disabled: resolveConditionalProperty(
        field.is_disabled,
        fieldsMap,
        context,
        false,
      ),
      is_required: resolveConditionalProperty(
        field.is_required,
        fieldsMap,
        context,
        false,
      ),
      is_shown: resolveConditionalProperty(
        field.is_shown,
        fieldsMap,
        context,
        true,
      ),
      is_disputable: resolveConditionalProperty(
        field.is_disputable,
        fieldsMap,
        context,
        false,
      ),
    })) as typeof question.fields,
  })) as NonNullable<ReviewTemplate>;
}
