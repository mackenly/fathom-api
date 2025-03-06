import { FathomApi, FathomApiError } from '../src';

// Create a new client with your API token
const fathom = new FathomApi({
  token: 'your-api-token'
});

// Example: Create a new site
async function createSite() {
  try {
    const newSite = await fathom.api.sites.create({
      name: 'My New Website'
    });
    console.log('Created Site:', newSite);
  } catch (error) {
    if (error instanceof FathomApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

createSite();

// Example: Update a site
async function updateSite() {
  try {
    const updatedSite = await fathom.api.sites.update('SITEID', {
      name: 'Updated Website Name',
      sharing: 'private',
      share_password: 'password123'
    });
    console.log('Updated Site:', updatedSite);
  } catch (error) {
    if (error instanceof FathomApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

updateSite();

// Example: Wipe site data
async function wipeSite() {
  try {
    const wipedSite = await fathom.api.sites.wipe('SITEID');
    console.log('Wiped Site:', wipedSite);
  } catch (error) {
    if (error instanceof FathomApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

wipeSite();

// Example: Delete a site
async function deleteSite() {
  try {
    const deletedSite = await fathom.api.sites.delete('SITEID');
    console.log('Deleted Site:', deletedSite);
  } catch (error) {
    if (error instanceof FathomApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

deleteSite();