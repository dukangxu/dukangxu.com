---
title: "比特币地址和脚本"
date: 2020-05-24T22:20:58+08:00
description: "bitcoin地址脚本的结构和原理"
tags: [blockchain, bitcoin]
enableComment: true
---

### 前言

作为一个区块链开发，很早之前研究过bitcoin(比特币)，但是当时主要是为了简单了解，所以只是看了一下块结构，交易结构方面，没有更细致的去了解

但是最近因为工作需要，下功夫研究了一下bitcoin(比特币)的交易，以及其原理

### 私钥

椭圆曲线secp256k1算法生成私钥(PrivKey)，加上网络类型(netID)，是否压缩公钥标识(CompressPubKey)参数生成WIF，WIF代表一个完整的bitcoin私钥。

为了可识别及方便记录，需要将WIF私钥编码，WIF编码后字符串结构为：网络类型+私钥+是否压缩公钥标识+校验码，即netID + PrivKey + CompressPubKey + cksum

### 地址

#### 常规地址

先生成AddressPubKey，包含公钥格式，公钥，网络PubKeyHashAddrID，再编码生成可识别常规地址

AddressPubKey中包含的公钥是序列后的公钥，序列化后的公钥分为压缩公钥和非压缩公钥

为了可识别及方便记录，需编码生成常规地址，常规地址编码后结构为：网络ID + 公钥hash + 校验码，netID + ripemd160(sha256(pubKey))+cksum

#### segwit(bech32)地址

先生成AddressWitnessPubKeyHash地址，AddressWitnessPubKeyHash包含网络Bech32HRPSegwit(hrp，相当于地址前缀)，隔离见证版本witnessVersion，以及公钥hash(由公钥pubkey序列化后先sha256，然后ripemd160得到)，

再编码生成可识别segwit(bech32)地址，segwit(bech32)地址编码后结构为：前缀 + 版本 + 公钥hash + 校验码，即```hrp + 1 + data(witnessVersion + converted(pubKey) + cksum)```

#### segwit p2wsh地址

先生成AddressWitnessScriptHash地址，AddressWitnessScriptHash包含网络Bech32HRPSegwit(hrp，相当于地址前缀)，隔离见证版本witnessVersion，以及公钥hash(由公钥pubkey序列化后sha256得到)

再编码生成可识别p2wsh地址，p2wsh地址地址编码后结构为：前缀 + 版本 + 公钥hash + 校验码，即hrp + 1 + data(witnessVersion + converted(pubKey) + cksum)

#### segwit地址

先生成segwit(bech32)地址，然后生成p2wsh脚本pkScript，pkScript也是redeemscript

再将pkScript生成AddressScriptHash，AddressScriptHash包含网络ID和脚本hash，脚本hash是ripemd160(sha256(pkScript))得到

最后编码生成可识别p2sh地址，地址结构为：网络ID + 脚本hash + 校验码，即netID + hash + cksum

### 交易

交易主要是锁定脚本和解锁脚本，必须一一对应才能完成交易，才能花费utxo

#### 锁定脚本
```markdown
p2pkh(pay-to-pubkey-hash-script)
OP_DUP OP_HASH160 <20-byte hash of Pubkey> OP_EQUALVERIFY OP_CHECKSIG

p2wpkh(pay-to-witness-pubkey-hash-script)
OP_0 <20-byte hash of Pubkey>

p2sh(pay-to-script-hash-script)
OP_HASH160 <20-byte hash of redeem script> OP_EQUAL

p2wsh(pay-to-witness-script-hash-script)
OP_0 <32-byte hash of redeem script>

p2ps(pay-to-pubkey-script，较少使用)
<serialized of PubKey> OP_CHECKSIG
```

#### 解锁脚本
```markdown
# p2sh
scriptSig:    <signature> <pubkey>
scriptPubKey: OP_DUP OP_HASH160 <20-byte hash of Pubkey> OP_EQUALVERIFY OP_CHECKSIG

# p2sh(以多重签名脚本为例)
scriptSig:    0 <SigA> <SigB> <2 PubkeyA PubkeyB PubkeyC PubkeyD PubkeyE 5 CHECKMULTISIG>
scriptPubKey: HASH160 <20-byte hash of redeem script> EQUAL

# p2wpkh
scriptSig:    (empty)
scriptPubKey: 0 <20-byte hash of Pubkey>
witness:      <signature> <pubkey>

# p2wsh(以多重签名脚本为例)
scriptSig:    (empty)
scriptPubKey: 0 <32-byte hash of redeem script>
witness:      0 <SigA> <SigB> <2 PubkeyA PubkeyB PubkeyC PubkeyD PubkeyE 5 CHECKMULTISIG>
```

* scriptPubKey为转入交易时的锁定脚本
* p2wpkh和p2wsh的解锁脚本为空，而真正的解锁脚本内容被移到了原交易之外的witness部分
* p2wsh锁定脚本中的hash值是32字节的，使用sha256(PubKey)计算得到
* p2wpkh中的hash值是20字节的，使用ripemd160(sha256(PubKey))计算得到

### 块大小

比特币的区块大小限制为1000000bytes，但是使用隔离见证后，witness不计算到区块大小中，而为了防止witness被滥用，重新定义了区块大小的限制

引入了一个新的概念，**块重量(block weight)**，**block weight = base size * 3 + total size**

base size是不包含witness数据的块大小
total size是包含了witness数据的总大小

隔离见证限制block weight <= 4000000

### 交易大小

因为witness不计算到块大小中，但是会被计算到块重量中，所以交易大小也做了新的限制

这里也引入了一个新的概念，**虚拟大小(virtual size)**，**virtual size = ((marked size + flag size + witness size) * 3 + tx size) / 4**

* marked 和 flag 占用2字节
* witness size 隔离见证数据大小
* tx size 交易总大小

例如，交易总大小tx size为200，marked，flag和witness的总大小为99，经计算virtual size为**(99 * 3 + 200) / 4 = 125**

### 最后

还有部分地址与脚本没有记录，后面有时间研究后在补上