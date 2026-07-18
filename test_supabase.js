const url = process.argv[2];
const key = process.argv[3];
async function test() {
  const res = await fetch(`${url}/rest/v1/products?select=*`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });
  const data = await res.text();
  console.log(res.status, data.slice(0, 200));
}
test();
