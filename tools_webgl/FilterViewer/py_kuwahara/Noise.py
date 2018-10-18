# -*- coding: utf-8 -*-
"""
Created on Thu Oct 18 15:27:45 2018

@author: g-xu-wang
"""

import cv2
import numpy as np

def RandomNoise(width=512,height=512):
    noise = np.zeros((height,width,3))
    for j in range(height):
        for i in range(width):
            for c in range(3):
                noise[j,i,c] = np.random.rand()*255
    return noise

out = np.uint8(RandomNoise())
cv2.imwrite("./img/noise.png",out)