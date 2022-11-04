from web3 import Web3
import asyncio
import json
from datetime import datetime
import logging
import numpy as np

alchemy_url = open("./websocket").read()
w3 = Web3(Web3.WebsocketProvider(alchemy_url))
abi = open("./abi.json").read()


class Monitor:
    def __init__(self, addr, name):
        self.filter = w3.eth.contract(address=addr, abi=abi).events.AnswerUpdated.createFilter(fromBlock='latest')
        self.name = name

    async def start_logging(self):
        while True:
            for event in self.filter.get_new_entries():
                json_event = json.loads(Web3.toJSON(event))
                print(f"{self.name} CHANGE:\ncurrent value: {json_event['args']['current']}\ntime of change: "
                      f"{str(datetime.fromtimestamp(float(json_event['args']['updatedAt'])))}\n"
                      f"full json: {json_event}\n")
                logging.warning(f"{self.name} CHANGE:\ncurrent value: {json_event['args']['current']}\ntime of change: "
                                f"{str(datetime.fromtimestamp(float(json_event['args']['updatedAt'])))}\n"
                                f"full json: {json_event}\n")
            await asyncio.sleep(2)


def main():
    if not w3.isConnected():
        print("Websocket isn't connected")
        return
    loop = asyncio.get_event_loop()
    contracts = json.loads(open("./contracts.json").read())
    groups = np.array([])
    try:
        for contract in contracts['contracts']:
            groups = np.append(groups, asyncio.gather(
                Monitor(*contract.values(), *contract.keys()).start_logging()))
        all_groups = asyncio.gather(*groups)
        loop.run_until_complete(all_groups)
    finally:
        loop.close()


main()
