import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';

const RichTextEditor = ({ content, onChange }) => {
  return (
    <TextField
      label="Contenu du cours"
      multiline
      minRows={6}
      fullWidth
      value={content}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

RichTextEditor.propTypes = {
  content: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default RichTextEditor;
