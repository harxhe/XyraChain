import os
from typing import Any

import requests


class PinataService:
    def __init__(self) -> None:
        self.api_key = os.getenv("PINATA_API_KEY")
        self.secret_api_key = os.getenv("PINATA_SECRET_API_KEY")

    def upload_json_to_ipfs(self, json_data: Any) -> str:
        if not self.api_key or not self.secret_api_key:
            raise ValueError("Pinata credentials are not configured.")

        response = requests.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            json=json_data,
            headers={
                "Content-Type": "application/json",
                "pinata_api_key": self.api_key,
                "pinata_secret_api_key": self.secret_api_key,
            },
            timeout=60,
        )
        response.raise_for_status()
        return response.json()["IpfsHash"]


pinata_service = PinataService()
