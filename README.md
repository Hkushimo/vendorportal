# Pokemart Expo Vendor Portal

Static GitHub Pages frontend for vendor lookup.

## Publish on GitHub Pages

1. Push these files to a GitHub repository.
2. In GitHub, open `Settings > Pages`.
3. Set the source to the branch that contains `index.html`.
4. Open the generated Pages URL.

## Update vendor data

Edit the `vendors` array in `app.js`. Keep comma-separated table numbers and Wi-Fi codes in the same fields:

```js
{
  name: "Vendor Name",
  alias: "Alias",
  email: "vendor@example.com",
  tables: "265, 266",
  wifiCodes: "14578-78545, 69545-54128"
}
```

Because GitHub Pages is static hosting, this email lookup is not private security. It hides details from the normal page view, but vendor data in `app.js` can still be inspected in the browser source.
