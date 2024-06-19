import {
  type Chain,
  zkSync,
  zkSyncInMemoryNode,
  zkSyncSepoliaTestnet,
  zkSyncLocalNode
} from "viem/chains";


export const chains: Chain[] = [
  zkSync,
  zkSyncSepoliaTestnet,
  zkSyncLocalNode,
  zkSyncInMemoryNode,
]

export const defaultChain = zkSyncInMemoryNode;