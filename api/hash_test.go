package main

import (
    "crypto/sha256"
    "encoding/hex"
    "fmt"
)

func main() {
    keys := []string{
        "cp_pk_test_AQE2OTBmNGNiYWkc_YxybWr5V7WvBvH_onwU4MThF5n6ccoL7IB4rszi",
    }

    for _, key := range keys {
        hash := sha256.Sum256([]byte(key))
        encoded := hex.EncodeToString(hash[:])
        fmt.Printf("Full Hash: %s\n", encoded)
    }
}
