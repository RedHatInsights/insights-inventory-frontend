import React from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  ClipboardCopy,
  Grid,
  GridItem,
  Content,
  ContentVariants,
} from '@patternfly/react-core';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

const InsightsPrompt = () => {
  return (
    <Alert
      variant="info"
      isInline
      title="Your insights-client is not reporting"
    >
      <Grid>
        <GridItem>
          <Grid hasGutter>
            <GridItem span={4}>
              <Content
                style={{
                  '--pf-v6-c-content--LineHeight': '1',
                  '--pf-v6-c-content--FontSize': '0.9rem',
                }}
              >
                <Content component={ContentVariants.p}>
                  With Insights you can easly:
                </Content>
                <Content
                  component="ul"
                  style={{
                    '--pf-t-c-content--ul--PaddingLeft': '0',
                    '--pf-t-c-content--ul--MarginLeft': '1rem',
                  }}
                >
                  <Content component="li">Optimize your IT Operations</Content>
                  <Content component="li">
                    Manage your security and compliance
                  </Content>
                  <Content component="li">
                    Resolve operational issues quickly
                  </Content>
                </Content>
              </Content>
            </GridItem>
            <GridItem span={4}>
              <Card isCompact>
                <CardTitle>Client setup</CardTitle>
                <CardBody>
                  Make sure the client is properly installed and registered
                </CardBody>
                <CardFooter>
                  <ClipboardCopy isCode isReadOnly variant={'expansion'}>
                    {
                      'yum install -y insights-client \ninsights-client --register'
                    }
                  </ClipboardCopy>
                </CardFooter>
              </Card>
            </GridItem>
            <GridItem span={4}>
              <Card isCompact style={{ height: '100%' }}>
                <CardTitle>Configure troubleshooting</CardTitle>
                <CardBody>
                  Proceed with verification on the client to ensure
                  insights-client is properly running and collecting data
                </CardBody>
                <CardFooter>
                  <Button
                    component="a"
                    target="_blank"
                    variant="link"
                    href="https://access.redhat.com/solutions/6758841"
                    isInline
                  >
                    Host not reporting data to Red Hat Insights
                  </Button>
                </CardFooter>
              </Card>
            </GridItem>
          </Grid>
        </GridItem>
        <GridItem style={{ paddingBottom: '8px' }}>
          <InsightsLink to={'/'} app="registration">
            How to register with insights-client?
          </InsightsLink>
        </GridItem>
        <GridItem>
          <Button
            component="a"
            target="_blank"
            variant="link"
            href="https://console.redhat.com/security/insights"
            isInline
          >
            How does Red Hat keep data secure?
          </Button>
        </GridItem>
      </Grid>
    </Alert>
  );
};

export default InsightsPrompt;
