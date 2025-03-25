import { t } from '@lingui/core/macro';
import { Column, Row } from '@react-email/components';
import { Link } from 'src/components/Link';
import { ShadowText } from 'src/components/ShadowText';

export const Footer = () => {
  return (
    <>
      <Row>
        <Column>
          <ShadowText>
            <Link
              href="https://nestermind.com/"
              value={t`Website`}
              aria-label={t`Visit nestermind's website`}
            />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link
              href="https://www.nestermind.com/academy"
              value={t`Academy`}
              aria-label={t`Visit nestermind's academy`}
            />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link
              href="https://www.linkedin.com/company/nestermind"
              value={t`Follow us`}
              aria-label={t`Follow us on Linkedin`}
            />
          </ShadowText>
        </Column>
      </Row>
      <ShadowText>
        Nestermind AG
        <br />
        Schaffhauserstrasse 78
        <br />
        8057 Zürich, Switzerland
      </ShadowText>
    </>
  );
};
