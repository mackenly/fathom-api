import { FathomApi, FathomApiError} from '../src';

// Create a new client with your API token
const fathom = new FathomApi({
  token: 'your-api-token'
});

// Example: Get account information
async function getAccountInfo() {
  try {
    const account = await fathom.api.account.get();
    console.log('Account:', account);
  } catch (error) {
    if (error instanceof FathomApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

getAccountInfo();

// Example: List all sites
async function listSites() {
  try {
    const sites = await fathom.api.sites.list();
    console.log('Sites:', sites);
  } catch (error) {
    if (error instanceof FathomApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

listSites();