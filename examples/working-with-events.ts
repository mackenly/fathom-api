import { FathomApi, FathomApiError } from '../src';

// Create a new client with your API token
const fathom = new FathomApi({
  token: 'your-api-token'
});

// Example: Create a new event
async function createEvent() {
  try {
    const newEvent = await fathom.api.events('SITEID').create({
      name: 'Newsletter Signup'
    });
    console.log('Created Event:', newEvent);
  } catch (error) {
    if (error instanceof FathomApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

createEvent();

// Example: Update an event
async function updateEvent() {
  try {
    const updatedEvent = await fathom.api.events('SITEID').update('EVENT_ID', {
      name: 'Updated Event Name'
    });
    console.log('Updated Event:', updatedEvent);
  } catch (error) {
    if (error instanceof FathomApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

updateEvent();

// Example: Wipe event data
async function wipeEvent() {
  try {
    const wipedEvent = await fathom.api.events('SITEID').wipe('EVENT_ID');
    console.log('Wiped Event:', wipedEvent);
  } catch (error) {
    if (error instanceof FathomApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

wipeEvent();

// Example: Delete an event
async function deleteEvent() {
  try {
    const deletedEvent = await fathom.api.events('SITEID').delete('EVENT_ID');
    console.log('Deleted Event:', deletedEvent);
  } catch (error) {
    if (error instanceof FathomApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

deleteEvent();