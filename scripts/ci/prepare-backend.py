"""Configure only the disposable backend checkout used for frontend CI."""
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1]).resolve()
config = root / 'supabase/config.toml'
text = config.read_text()
text = re.sub(r'^project_id = .*$', 'project_id = "codetekt-frontend-ci"', text, flags=re.M)
# Different ports keep local verification separate from the developer's stack.
text = re.sub(r'\b543(\d{2})\b', r'554\1', text)
text = text.replace("sql_paths = ['./seeds/*.sql']", 'sql_paths = ["./seeds/0_vault_setup.sql", "./seeds/1_user.sql", "./seeds/2_review-template.sql", "./seeds/6_tutorial-content.sql"]')
config.write_text(text)
for filename in ['1_user.sql', '2_review-template.sql']:
    seed = root / 'supabase/seeds' / filename
    seed.write_text(seed.read_text().replace('gorm-labenz@hotmail.com', 'seed-author@example.test'))
(root / 'ci-functions.env').write_text('DB_WEBHOOK_SECRET=super-secret-db-webhook-key-123\n')
