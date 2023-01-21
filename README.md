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

## HW 2. Разработка смарт-контрактов

### Идея курсового проекта - кросс-платформенный бот для покупки NFT

Изучая интересы людей, так или иначе связанных с блокчейном, я столкнулся с тем, что множество людей занимаются купле-продажой NFT-коллекций. Соответственно, чем быстрее будет ими куплена NFT-коллекция, тем выгоднее они смогут ее позже продать, что подразумевает, что им ценна каждая секунда, которая пройдет от нажатия кнопки на сайте с NFT до получения ими самой NFT.

Я хочу реализовать бота, который будет по желанию пользователя формировать расписание покупки коллекций, и во время дропа коллекции приобретать ее для пользователя.

Для начала, я планирую реализовать бота, который работает с Ethereum и OpenSea, если же у меня это получится, я планирую расширяться на другие платформы.

Основный стэк проекта - солидити + python, однако, вполне возможно, он поменяется по мере погружения в тему (например, в зависимости от того, будет ли это телеграм-бот, сайт или приложение)

В случае, если этот проект не покажется преподавателям курса достойным оценки, я планирую заняться аналитикой данных Ethereum.


## HW 3. Blockchain software ecosystem

Программа мониторит изменение курса валют оракулов

Весь код находится в файле main.py, запустить его можно командой python3 main.py

Контракты, с которыми работает код, указаны в файле contracts.json (На данный момент программа мониторит события изменения цен для пар: ETH / USD, LINK / ETH, USDT / ETH)

Ссылка на alchemy-ноду должна находиться в файле websocket

Abi контракта, с которым работает код, должно лежать в файле abi.json

Пример вывода лога:

```angular2html
WARNING:root:USDT / ETH CHANGE:
current value: 626562320587710
time of change: 2022-11-04 15:41:23
full json: {'args': {'current': 626562320587710, 'roundId': 8249, 'updatedAt': 1667565683}, 'event': 'AnswerUpdated', 'logIndex': 142, 'transactionIndex': 63, 'transactionHash': '0x8ae43fed89120a859acfe75c3dca4f45698139f70e8684fbe7a843fa062cc852', 'address': '0x7De0d6fce0C128395C488cb4Df667cdbfb35d7DE', 'blockHash': '0xb7add654371eb48939d94e261c37f50a3bc413aa7be3c86a5a14bf5c8ee52f5b', 'blockNumber': 15896716}
```


##HW 7. Symmetric cryptography

Программа генерирует распределение между студентами и билетами, на основе SipHash, используя parameter как сид 

Запуск
```angular2html
python3 app.py <path to file> <number of tickets> <parametr>
```

Пример вывода
```angular2html
$ python3 app.py data.txt 40 90

Иванов Иван Иванович 32
Ярцев Ярослав Ярославович 30
Петров Петр Петрович 34
Жжж Михаил Владимирович 16
Картер Жорж Николаевич 21
Маркони Пьер Мустангович 4
Пум Пурум Алексеевич 28
Кириллов Яромир Трифанович 20
```