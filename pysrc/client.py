from typing import Optional
import numpy as np
import os
import requests
import base64


def send_image(name: str, pixels: np.ndarray, port: Optional[int] = None):
    assert isinstance(pixels, np.ndarray), "pixels must be a numpy array"
    assert pixels.dtype == np.uint8, "pixels must be of dtype np.uint8"

    if pixels.ndim == 2:
        pixels = np.dstack([pixels])

    channels = pixels.shape[2]
    if port is None:
        if not os.path.exists(os.path.join(os.getcwd(), ".liv-port")):
            raise FileNotFoundError("No live-port file found in the current directory")
        if not os.path.isfile(os.path.join(os.getcwd(), ".liv-port")):
            raise ValueError("Invalid live-port file")
        with open(os.path.join(os.getcwd(), ".liv-port"), "r", encoding="utf-8") as f:
            port = int(f.read())

    endpoint = f"http://localhost:{port}/pixels"

    print("requesting begin...")

    requests.post(
        endpoint + "/begin",
        json={
            "name": name,
            "channels": channels,
            "width": pixels.shape[1],
            "height": pixels.shape[0],
            "scaleMode": "fit-preserve-aspect",
        },
        timeout=30
    )

    byte_chunks = []

    BYTE_CHUNK_SIZE = 4096

    cursor = 0

    pixel_bytes = pixels.tobytes()

    while cursor < pixels.nbytes:
        byte_chunks.append(
            pixel_bytes[cursor : min(cursor + BYTE_CHUNK_SIZE, len(pixel_bytes))]
        )
        cursor += BYTE_CHUNK_SIZE

    offset = 0

    for i,byte_chunk in enumerate(byte_chunks):
        print(f"requesting put {i+1}/{len(byte_chunks)}...")
        requests.post(
            endpoint + "/put",
            json={
                "offset": offset,
                "bytesBase64": base64.b64encode(byte_chunk).decode("utf-8"),
            },
            timeout=30
        )
        offset += len(byte_chunk)

    print("requesting show...")

    requests.get(endpoint + "/show", timeout=30)
