import { githubLoginToU128 } from '../oracle_updater/updaters';

describe('github keccak', () => {
    test('basic u128 login compute', () => {
        expect(githubLoginToU128("author")).toBe(BigInt("0x5cd6cba91ec753a468181414297d8"));

    });

});