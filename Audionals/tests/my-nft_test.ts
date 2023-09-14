import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types,
  } from "https://deno.land/x/clarinet@v0.12.0/index.ts";
  import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
  
  Clarinet.test({
    name: "Ensure that NFT token URL and ID is as expected",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      let wallet_1 = accounts.get("wallet_1")!;
      
      // Mint NFT with metadata
      let block = chain.mineBlock([
        Tx.contractCall("my-nft", "mint-with-metadata", [
          types.ascii("https://token.uri"),
          types.ascii("Qm123"), 
          types.ascii("Strings"),
          types.ascii("Acoustic Guitar"),
          types.ascii("John Doe")
        ], wallet_1.address),
      ]);

      // Get token data
      block = chain.mineBlock([
        Tx.contractCall("my-nft", "get-token-data", [types.uint(1)], wallet_1.address),
      ]);

      // Assert token data
      block.receipts[0].result
        .expectOk()
        .expectSome()
        .expectAscii("https://token.uri")
        .expectAscii("Qm123")
        .expectAscii("Strings")
        .expectAscii("Acoustic Guitar")
        .expectAscii("John Doe");

      // Get token ID
      block = chain.mineBlock([
        Tx.contractCall("my-nft", "get-last-token-id", [], wallet_1.address),
      ]);

      // Assert token ID
      block.receipts[0].result.expectOk().expectUint(1);
      
    },
  });