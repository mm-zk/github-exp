import { type Chain, zkSync, zkSyncSepoliaTestnet } from '@wagmi/core/chains'
import { getAccount, getNetwork, watchAccount, watchNetwork, configureChains, createConfig } from '@wagmi/core';
import { InjectedConnector } from '@wagmi/core/connectors/injected';
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask';
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet';
import { publicProvider } from '@wagmi/core/providers/public';

export const chains: Chain[] = [
  zkSync,
  zkSyncSepoliaTestnet,
  ...(
    import.meta.env.MODE === "development" ?
      [
        {
          id: 270,
          name: "Dockerized local node",
          network: "zksync-dockerized-node",
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: {
            default: {
              http: ['http://localhost:3050'],
            },
            public: {
              http: ['http://localhost:3050'],
            },
          },
          blockExplorers: {
            default: {
              name: 'Local Explorer',
              url: 'http://localhost:3010',
            },
          },
          testnet: true
        },
        {
          id: 260,
          name: "In-memory local node",
          network: "zksync-in-memory-node",
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: {
            default: {
              http: ['http://127.0.0.1:8011'],
            },
            public: {
              http: ['http://127.0.0.1:8011'],
            },
          },
          testnet: true
        },
      ]
      : []
  ),
];

export const defaultChain = import.meta.env.MODE === "development" ? zkSyncSepoliaTestnet : zkSync;

// Function to reorder the array based on a specified chain_id
function prioritizeChainById(chainList: Chain[], targetId: number): Chain[] {
  // First, find the index of the chain with the given targetId
  const targetIndex = chainList.findIndex(chain => chain.id === targetId);

  // If the chain was found and it's not already the first element
  if (targetIndex > 0) {
    // Remove the target chain from its current position
    const [targetChain] = chainList.splice(targetIndex, 1);
    // Insert the target chain at the beginning of the array
    chainList.unshift(targetChain);
  }

  return chainList;
}

export const useWagmi = defineStore("wagmi", () => {
  const { publicClient, webSocketPublicClient } = configureChains(
    prioritizeChainById(chains, Number(import.meta.env.VITE_API_DEFAULT_CHAIN)),
    [
      publicProvider(),
    ],
  )

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [
      new MetaMaskConnector({ chains }),
      new InjectedConnector({
        chains,
        options: {
          name: 'Injected',
          shimDisconnect: true,
        },
      }),
    ],
    publicClient,
    webSocketPublicClient,
  })

  const account = ref(getAccount());
  const network = ref(getNetwork());
  watchAccount((updatedAccount) => {
    account.value = updatedAccount;
  });
  watchNetwork((updatedNetwork) => {
    network.value = updatedNetwork;
  });

  return {
    account,
    network,
  }
});