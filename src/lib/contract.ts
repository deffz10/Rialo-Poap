import { ethers } from "ethers"

export const CONTRACT_ADDRESS =
  "0xB4fD7506Da584e2Eb7880e266f29C989793BFf2d"

export const ABI = [
  "function claimBadge(uint256 eventId,string metadataURI,uint256 rewardXBT)",
  "function hasUserClaimed(uint256 eventId,address user) view returns (bool)",
  "function totalClaimed(uint256 eventId) view returns (uint256)",
  "function xbtBalance(address user) view returns (uint256)"
]

/* =========================
   SEPOLIA CONFIG
========================= */

const BASE_SEPOLIA_CHAIN_ID = "0x14A34" // 84532

async function switchToBaseSepolia() {
  if (typeof window === "undefined") return
  if (!window.ethereum) return

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
    })
  } catch (error) {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: BASE_SEPOLIA_CHAIN_ID,
          chainName: "Base Sepolia",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["https://sepolia.base.org"],
          blockExplorerUrls: [
          "https://sepolia.basescan.org",
          ],
        },
      ],
    })
  }
}

/* =========================
   PROVIDER
========================= */

async function getProvider() {
  if (typeof window === "undefined") {
    throw new Error("Window not found")
  }

  if (!window.ethereum) {
    throw new Error("Wallet not found")
  }

  return new ethers.BrowserProvider(
    window.ethereum
  )
}

/* =========================
   SIGNER
========================= */

export async function getSigner() {
  await switchToBaseSepolia()

  const provider =
    await getProvider()

  await provider.send(
    "eth_requestAccounts",
    []
  )

  return await provider.getSigner()
}

/* =========================
   CONTRACT
========================= */

export async function getContract(
  write: boolean = false
) {
  const provider =
    await getProvider()

  if (write) {
    const signer =
      await getSigner()

    return new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      signer
    )
  }

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    ABI,
    provider
  )
}

/* =========================
   CLAIM BADGE
========================= */

export async function claimBadge(
  eventId: number,
  metadataURI: string = "",
  rewardXBT: number = 0
) {
  const contract =
    await getContract(true)

  const tx =
    await contract.claimBadge(
      eventId,
      metadataURI,
      rewardXBT
    )

  await tx.wait()

  return tx.hash
}

/* =========================
   READ
========================= */

export async function hasUserClaimed(
  eventId: number,
  wallet: string
) {
  const contract =
    await getContract(false)

  return await contract.hasUserClaimed(
    eventId,
    wallet
  )
}

export async function getTotalClaimed(
  eventId: number
) {
  const contract =
    await getContract(false)

  return await contract.totalClaimed(
    eventId
  )
}

export async function getXbtBalance(
  wallet: string
) {
  const contract =
    await getContract(false)

  return await contract.xbtBalance(
    wallet
  )
}
