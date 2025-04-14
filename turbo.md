# Turbopack Configuration for Next.js

## What is Turbopack?

Turbopack is a Rust-based successor to Webpack, developed by the creator of Webpack. It's designed to be significantly faster than Webpack, with:

- Up to 700x faster updates than Webpack
- 10x faster cold start than Webpack
- 4x faster than Vite

## Configuration Details

We've configured Turbopack in your `next.config.mjs` file for optimal performance:

```javascript
experimental: {
  turbo: {
    resolveAlias: {
      '@': './src',
    },
  },
}
```

## Using Turbopack

To use Turbopack, run:

```bash
npm run dev:turbo
```

This will start the development server with Turbopack enabled.

## Benefits

- **Faster Development**: Turbopack's incremental computation engine only rebuilds what changed
- **Optimized for Next.js**: Built specifically for Next.js applications
- **Better Developer Experience**: Less waiting, more coding

## Limitations

Turbopack is still in beta, so some features may not work as expected:

- Some webpack loaders may not be compatible
- Some plugins may not work
- HMR might occasionally fail for complex updates

## Troubleshooting

If you encounter issues with Turbopack:

1. Try restarting the development server
2. Check for compatibility issues with your dependencies
3. Fall back to the standard webpack build with `npm run dev`

## Learn More

- [Turbopack Documentation](https://turbo.build/pack/docs)
- [Next.js Turbopack Documentation](https://nextjs.org/docs/advanced-features/turbopack)
