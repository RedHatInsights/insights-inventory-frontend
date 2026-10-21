import React from 'react';
import PropTypes from 'prop-types';
import {
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  ClipboardCopyButton,
} from '@patternfly/react-core';

const RegAssistCodeBlock = ({ code = [], classname, setStep }) => {
  const [copied, setCopied] = React.useState(false);

  const clipboardCopyFunc = (event, text) => {
    navigator.clipboard.writeText(text.toString());
  };
  const onClick = (event, text) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
    setStep && setStep(3);
  };

  const actions = (
    <>
      <CodeBlockAction>
        <ClipboardCopyButton
          id="activation-keys-copy-button"
          textId="code-content"
          aria-label="Copy to clipboard"
          onClick={(e) => onClick(e, code)}
          exitDelay={copied ? 1500 : 600}
          maxWidth="110px"
          variant="plain"
          onTooltipHidden={() => setCopied(false)}
        >
          {copied ? 'Successfully copied to clipboard!' : 'Copy to clipboard'}
        </ClipboardCopyButton>
      </CodeBlockAction>
    </>
  );

  /*remove code.map when new reg Assistant is implemented*/
  return (
    <CodeBlock
      className={`pf-v6-u-mb-lg pf-v6-u-mt-md ${classname}`}
      actions={actions}
    >
      {Array.isArray(code) ? (
        code.map((line, idx) => (
          <CodeBlockCode key={`code-block-line-${idx}`}>{line}</CodeBlockCode>
        ))
      ) : (
        <CodeBlockCode key={`code-block-line`}>{code}</CodeBlockCode>
      )}
    </CodeBlock>
  );
};

RegAssistCodeBlock.propTypes = {
  classname: PropTypes.string,
  code: PropTypes.array,
  setStep: PropTypes.func,
};

export default RegAssistCodeBlock;
