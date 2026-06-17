/* eslint-disable @next/next/no-img-element -- ImageResponse/Satori renders plain img elements. */

import { getLocalDate } from '@/lib/utils';
import type { ShareImageData } from './share-image-data';

interface ShareImageTemplateProps {
  data: ShareImageData;
  logoUrl: string;
  folderUrl: string;
}

export function ShareImageTemplate({
  data,
  logoUrl,
  folderUrl,
}: ShareImageTemplateProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#140735',
        color: '#ffffff',
        fontFamily: 'Effra, Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 456,
          left: 730,
          display: 'flex',
          width: 255,
          height: 43,
        }}
      >
        <img
          src={logoUrl}
          width={260}
          height={44}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: 260,
            height: 44,
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 512,
          left: 168,
          width: 815,
          height: 675,
          display: 'flex',
        }}
      >
        <img
          src={folderUrl}
          width={815}
          height={675}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: 815,
            height: 675,
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 35,
            left: 48,
            display: 'flex',
            fontSize: 36,
            fontWeight: 400,
            textTransform: 'uppercase',
          }}
        >
          Fall {data.caseNumber}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 151,
            left: 46,
            width: 723,
            height: 474,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '0 0 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              fontSize: data.title.length > 95 ? 46 : 52,
              fontWeight: 900,
              lineHeight: 1.18,
              letterSpacing: -1,
              maxHeight: 310,
              overflow: 'hidden',
            }}
          >
            {data.title}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 34,
              fontWeight: 600,
              lineHeight: 1.2,
              opacity: 0.9,
            }}
          >
            {data.source}, {getLocalDate(data.submittedAt)}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 1256,
          display: 'flex',
          fontSize: 36,
          fontWeight: 400,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        Die Bewertung unserer Community
      </div>

      <div
        style={{
          position: 'absolute',
          top: 1320,
          left: 161,
          width: 815,
          height: 126,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 31,
          backgroundColor: data.ratingBackgroundColor,
          color: data.ratingForegroundColor,
          fontSize: data.ratingLabel.length > 25 ? 34 : 40,
          fontWeight: 400,
          textTransform: 'uppercase',
        }}
      >
        {data.ratingLabel}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 1498,
          display: 'flex',
          fontSize: 48,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        {data.displayUrl}
      </div>
    </div>
  );
}
