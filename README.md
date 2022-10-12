# Homeworks for Mixbytes blockchain course in ITMO university

## HW 1. Введение в смарт-контракты

Просмотреть код контрактов заданного преподавателем проекта, найти место, реализующее определенную логику и привести
diff (результат работы git diff), изменяющий поведение смарт-контракта:

### MultiSigWallet

https://github.com/gnosis/MultiSigWallet/blob/master/contracts/MultiSigWallet.sol - сделать, чтобы с баланса
multisig-контракта за одну транзакцию не могло бы уйти больше, чем 66 ETH

```diff
--- a/examples/MultiSigWallet.sol
+++ b/solutions/MultiSigWallet.sol
24a25
+    uint constant public MAX_TRANSACTION_VALUE = 66 ether;

84a86,90
+    modifier validTransactionValue(uint value) {
+        require(value <= MAX_TRANSACTION_VALUE);
+        _;
+    }
291a298
+        validTransactionValue(value)
```
Нужно заметить, что последняя строка добавлена в функцию addTransaction

### ERC20

https://github.com/OpenZeppelin/openzeppelin-contracts/blob/f2112be4d8e2b8798f789b948f2a7625b2350fe7/contracts/token/ERC20/ERC20.sol

- сделать, чтобы токен не мог бы быть transferred по субботам

```diff
--- a/examples/ERC20.sol
+++ b/solutions/ERC20.sol
210a211
+    require((block.timestamp /  86400 + 4)%7 != 5, "ERC20: can not do transfer on Saturdays");
```
В функции _transfer

### DividendToken

https://github.com/mixbytes/solidity/blob/076551041c420b355ebab40c24442ccc7be7a14a/contracts/token/DividendToken.sol -
сделать чтобы платеж в ETH принимался только специальной функцией, принимающей помимо ETH еще комментарий к платежу (
bytes[32]). Простая отправка ETH в контракт запрещена

```diff
--- a/examples/DividendToken.sol
+++ b/solutions/DividendToken.sol
21c21
-    event Deposit(address indexed sender, uint256 value);
---
+    event Deposit(address indexed sender, uint256 value, bytes32 message);
40c40
-     function() external payable {
---
+     function pay(bytes32 message) external payable {
42c42
-             emit Deposit(msg.sender, msg.value);
---
+             emit Deposit(msg.sender, msg.value, message);
```