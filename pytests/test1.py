import numpy as np
import sys, os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from pysrc.client import send_image


def main():
    data = np.zeros((500, 500), np.uint8)
    for x in range(500):
        for y in range(500):
            dx = x - 250
            dy = y - 250
            dist = np.sqrt(dx**2 + dy**2)
            if dist < 250:
                data[y, x] = np.uint8(255 * (1 - dist / 250))
    
    send_image("test1",data)



if __name__ == "__main__":
    main()
