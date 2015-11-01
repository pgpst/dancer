package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"

	"github.com/codahale/chacha20"
	"golang.org/x/crypto/poly1305"
)

func hexify(input []byte, prefix string) string {
	sp := hex.EncodeToString(input)
	result := prefix

	for i := 0; i < len(sp)/2; i++ {
		chunk := sp[i*2 : (i+1)*2]
		result += "0x" + chunk + ", "
		if (i+1)%8 == 0 {
			result += "\n"

			if i+1 < len(sp)/2 {
				result += prefix
			}
		}
	}

	return result
}

func main() {
	fmt.Println("[")

	// 5 tests
	for i := 0; i < 5; i++ {
		plaintext := make([]byte, 64)
		rand.Read(plaintext)

		key := make([]byte, 32)
		rand.Read(key)

		nonce := make([]byte, 8)
		rand.Read(nonce)

		stream, _ := chacha20.New(key[:], nonce)

		e32a := make([]byte, 32)
		var pkey [32]byte
		stream.XORKeyStream(pkey[:], e32a)

		ciphertext := make([]byte, 64)
		stream.XORKeyStream(ciphertext, plaintext)

		var tag [16]byte
		poly1305.Sum(&tag, ciphertext, &pkey)

		fmt.Printf(`	{
		key: new Buffer([
%s		]),
		nonce: new Buffer([
%s		]),
		plain: new Buffer([
%s		]),
		cipher: new Buffer([
%s		]),
		tag: new Buffer([
%s		]),
	},
`,
			hexify(key, "\t\t\t"),
			hexify(nonce, "\t\t\t"),
			hexify(plaintext, "\t\t\t"),
			hexify(ciphertext, "\t\t\t"),
			hexify(tag[:], "\t\t\t"),
		)
	}

	fmt.Println("]")
}
