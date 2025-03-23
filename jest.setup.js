import { TextEncoder, TextDecoder } from "util";

// Polyfill TextEncoder and TextDecoder for Jest environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
