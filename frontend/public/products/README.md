# Product photos

The storefront loads each device's photo from this folder. The filenames are set by `imageUrl` in
[`src/data/storeProducts.ts`](../../src/data/storeProducts.ts), so a file only shows up if its name matches exactly.

Until a photo is added, the store shows a neutral phone outline in its place, so a missing file never breaks the page.

## Files the store expects

| File | Device | Colour | Storage | Grade |
|---|---|---|---|---|
| `iphone-15-pro.jpg` | Apple iPhone 15 Pro Max | Natural Titanium | 256GB | Mint |
| `iphone-14-pro.jpg` | Apple iPhone 14 Pro | Deep Purple | 128GB | Good |
| `iphone-13.jpg` | Apple iPhone 13 | Midnight | 128GB | Mint |
| `iphone-12.jpg` | Apple iPhone 12 | Blue | 64GB | Fair |
| `iphone-se.jpg` | Apple iPhone SE (3rd Gen) | Starlight | 64GB | Good |
| `galaxy-s24-ultra.jpg` | Samsung Galaxy S24 Ultra | Titanium Gray | 512GB | Mint |
| `galaxy-s23.jpg` | Samsung Galaxy S23 | Phantom Black | 256GB | Good |
| `galaxy-z-fold-5.jpg` | Samsung Galaxy Z Fold 5 | Icy Blue | 512GB | Mint |
| `galaxy-z-flip-5.jpg` | Samsung Galaxy Z Flip 5 | Mint | 256GB | Good |
| `galaxy-a54.jpg` | Samsung Galaxy A54 | Awesome Graphite | 128GB | Fair |
| `pixel-8-pro.jpg` | Google Pixel 8 Pro | Bay Blue | 256GB | Mint |
| `pixel-7a.jpg` | Google Pixel 7a | Sea | 128GB | Mint |
| `pixel-7.jpg` | Google Pixel 7 | Lemongrass | 128GB | Good |
| `pixel-6-pro.jpg` | Google Pixel 6 Pro | Cloudy White | 128GB | Fair |
| `pixel-fold.jpg` | Google Pixel Fold | Obsidian | 256GB | Mint |
| `apple-watch-9.jpg` | Apple Watch Series 9 | Midnight | 64GB | Mint |
| `airpods-pro.jpg` | Apple AirPods Pro (2nd Gen) | White | — | Mint |

## Photo guidelines

These keep every card in the product grid consistent with the storefront design.

- **Shape:** portrait 4:5, at least 1200 × 1500 px. The grid crops to 4:5 and the product page shows it square, so keep the device centred with space around it.
- **Background:** plain light grey (`#F4F4F2`, the store's paper colour), white, or a transparent PNG/WebP. Avoid busy scenes, hands and props.
- **Framing:** the whole device, front-facing or a slight three-quarter angle, filling about 75% of the height.
- **Format:** `.jpg` or `.webp`, under 400 KB each. If you switch format, update the extension in `storeProducts.ts` too.
- **Honesty:** the product page tells shoppers the photos show *this exact unit as inspected*. For real listings, photograph the actual device, including any marks that justify a Good or Fair grade.

## Adding a new product

1. Add the photo here, named in lowercase with dashes, for example `galaxy-s25.jpg`.
2. Add the product to `CATALOG_PRODUCTS` in `src/data/storeProducts.ts` with `imageUrl: '/products/galaxy-s25.jpg'`.
3. Set `imageColorHex` to the device's colour. It tints the placeholder and the soft glow behind the photo.

## Stock photos

For demos, free photos from Pexels, Unsplash or Pixabay work, but check each licence and keep a note of the source. Swap them for real unit photos before going live.
