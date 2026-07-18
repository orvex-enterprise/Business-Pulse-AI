const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

const target = `  const handleAddConnection = async () => {
    if (!newConnType) {`;

const replacement = `  const handleAddConnection = async () => {
    try {
    if (!newConnType) {`;

const targetEnd = `      toast.error(e.message);
    }
  };`;

const replacementEnd = `      toast.error(e.message);
    }
    } catch (unexpectedError: any) {
      console.error(unexpectedError);
      toast.error(unexpectedError.message || 'An unexpected error occurred');
      setConnStatus('error');
    }
  };`;

content = content.replace(target, replacement).replace(targetEnd, replacementEnd);
fs.writeFileSync('src/pages/Settings.tsx', content);
