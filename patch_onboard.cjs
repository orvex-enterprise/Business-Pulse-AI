const fs = require('fs');
let content = fs.readFileSync('src/pages/Onboarding.tsx', 'utf-8');

// Fix handleNext
const handleNextTarget = `  const handleNext = async () => {
    if (store.step === 2 && !store.databaseType) {`;
const handleNextReplacement = `  const handleNext = async () => {
    if (store.step === 1 && !store.industry?.trim()) {
      alert("Please provide an Industry to continue.");
      return;
    }
    if (store.step === 2 && !store.databaseType) {`;
content = content.replace(handleNextTarget, handleNextReplacement);

// Fix the settings store save
const settingsSaveTarget = `          setCompanyDetails({
            companyName: store.companyName || 'Acme Corp',
            industry: store.industry || 'Tech Retail',
            businessType: store.businessType,`;
const settingsSaveReplacement = `          setCompanyDetails({
            companyName: store.companyName || 'Acme Corp',
            industry: store.industry,
            businessType: store.businessType,`;
content = content.replace(settingsSaveTarget, settingsSaveReplacement);

// Disable the continue button
const buttonTarget = `<Button onClick={handleNext}>
              {store.step === 5 ? 'Go to Dashboard' : 'Continue'}
            </Button>`;
const buttonReplacement = `<Button onClick={handleNext} disabled={store.step === 1 && !store.industry?.trim()}>
              {store.step === 5 ? 'Go to Dashboard' : 'Continue'}
            </Button>`;
content = content.replace(buttonTarget, buttonReplacement);

fs.writeFileSync('src/pages/Onboarding.tsx', content);
