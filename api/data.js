export default async function handler({ query }) {
  const url = new URL('https://ticketing.olaii.com/api/v2/events/');
  url.search = new URLSearchParams(query);
  console.log("Request:", url.href);
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();
  const events = data.results;

  return {
    events
  };
}
