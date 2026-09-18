// libheif-js ships a hand-written .d.ts only for its raw Emscripten
// bindings (libheif-wasm/libheif.d.ts), not for the friendly wasm-bundle
// entry point used in src/lib/compress-image.ts. Its actual shape is an
// Emscripten module factory result (may resolve async), handled
// defensively at the call site — this just satisfies the compiler.
interface LibheifImage {
  get_width(): number;
  get_height(): number;
  display(
    imageData: ImageData,
    callback: (displayData: ImageData | null) => void
  ): void;
}

interface LibheifModule {
  HeifDecoder: new () => { decode(bytes: Uint8Array): LibheifImage[] };
}

declare module "libheif-js/wasm-bundle" {
  const mod: LibheifModule | Promise<LibheifModule>;
  export default mod;
}
