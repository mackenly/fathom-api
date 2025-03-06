import FathomApi from '../src';

// Create a new client with your API token
const fathom = new FathomApi({
  token: 'your-api-token'
});

// Example: Get aggregation report for pageviews
async function getPageviewReport() {
  try {
    const report = await fathom.api.reports.aggregation({
      entity: 'pageview',
      entity_id: 'SITEID',
      aggregates: 'visits,uniques,pageviews',
      date_grouping: 'day',
      field_grouping: 'pathname',
      date_from: '2022-01-01',
      date_to: '2022-01-31',
      filters: [
        {
          property: 'pathname',
          operator: 'is',
          value: '/blog'
        }
      ]
    });
    console.log('Pageview Report:', report);
  } catch (error) {
    console.error('Error:', error);
  }
}

getPageviewReport();

// Example: Get aggregation report for events
async function getEventReport() {
  try {
    const report = await fathom.api.reports.aggregation({
      entity: 'event',
      entity_id: 'EVENT_ID',
      aggregates: 'conversions,unique_conversions',
      date_grouping: 'month'
    });
    console.log('Event Report:', report);
  } catch (error) {
    console.error('Error:', error);
  }
}

getEventReport();

// Example: Get current visitors
async function getCurrentVisitors() {
  try {
    const visitors = await fathom.api.reports.currentVisitors({
      site_id: 'SITEID',
      detailed: true
    });
    console.log('Current Visitors:', visitors);
  } catch (error) {
    console.error('Error:', error);
  }
}

getCurrentVisitors();