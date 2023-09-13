;; use the SIP009 interface (testnet)
;; trait deployed by deployer address from ./settings/Devnet.toml
(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.nft-trait.nft-trait)

;; Define a new NFT
(define-non-fungible-token AudionalsTest1 uint)

;; Store the last issued token ID
(define-data-var last-id uint u0)

;; Updated data map with URI, IPFS link, and the additional fields
(define-map token-data 
    { token-id: uint } 
    { 
      uri: (string-ascii 256), 
      ipfs-link: (string-ascii 46),
      instrumentClass: (string-ascii 64),
      instrumentType: (string-ascii 64),
      creatorName: (string-ascii 64)
    }
)

;; Updated mint function to accept the additional metadata
(define-public (mint-with-metadata (uri (string-ascii 256)) 
                                  (ipfs-link (string-ascii 46)) 
                                  (instrumentClass (string-ascii 64)) 
                                  (instrumentType (string-ascii 64))
                                  (creatorName (string-ascii 64)))
    (let ((next-id (+ u1 (var-get last-id))))
        (var-set last-id next-id)
        (map-set token-data 
            { token-id: next-id } 
            { uri: uri, 
              ipfs-link: ipfs-link, 
              instrumentClass: instrumentClass,
              instrumentType: instrumentType,
              creatorName: creatorName 
            }
        )
        (nft-mint? AudionalsTest1 next-id tx-sender)
    )
)

;; Function to get token URI, IPFS link, and the additional fields for a given token
(define-read-only (get-token-data (token-id uint))
    (map-get? token-data { token-id: token-id })
)

;; Claim a new NFT
(define-public (claim)
  (mint tx-sender))

  (define-read-only (get-token-uri (token-id uint))
  (match (map-get? token-uris { token-id: token-id })
         entry (ok (some (get uri entry)))
         (ok none)))


;; SIP009: Transfer token to a specified principal
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
     (asserts! (is-eq tx-sender sender) (err u403))
     ;; Make sure to replace MY-OWN-NFT
     (nft-transfer? AudionalsTest1 token-id sender recipient)))

(define-public (transfer-memo (token-id uint) (sender principal) (recipient principal) (memo (buff 34)))
  (begin 
    (try! (transfer token-id sender recipient))
    (print memo)
    (ok true)))

;; SIP009: Get the owner of the specified token ID
(define-read-only (get-owner (token-id uint))
  ;; Make sure to replace MY-OWN-NFT
  (ok (nft-get-owner? AudionalsTest1 token-id)))

  (define-map token-uris { token-id: uint } { uri: (string-ascii 256) })

(define-public (set-token-uri (token-id uint) (uri (string-ascii 256)))
  (if (map-set token-uris { token-id: token-id } { uri: uri })
      (ok true)
      (err u1) ;; or another error code
  )
)

;; SIP009: Get the last token ID
(define-read-only (get-last-token-id)
  (ok (var-get last-id)))


;; Internal - Mint new NFT
(define-private (mint (new-owner principal))
    (let ((next-id (+ u1 (var-get last-id))))
      (var-set last-id next-id)
      ;; Make sure to replace MY-OWN-NFT
      (nft-mint? AudionalsTest1 next-id new-owner)))