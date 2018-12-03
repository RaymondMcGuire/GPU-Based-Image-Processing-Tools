#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Oct  3 10:51:24 2018

@author: raymondmg
"""

import cv2 as cv
import numpy as np
from enum import Enum
import Gaussian 

class SST_TYPE(Enum):
    CLASSIC = 1


class SST:
    def __init__(self,image,type):
        self.type = type
        self.image = image
    def sst_classic(self,kernel_size=5,sigma=2,tau=0.002,box_filter = [[1,0],[-1,0],[0,1],[0,-1]],iter=5):
        img = self.image
        self.sigma = sigma
        height,width,channel = img.shape
        dimage = np.float32(img)

                
        
        gray = cv.cvtColor(dimage, cv.COLOR_BGR2GRAY)
        

        sobelx = cv.Sobel(gray, cv.CV_32F, 1, 0, ksize=3)
        sobely = cv.Sobel(gray, cv.CV_32F, 0, 1, ksize=3)

        tensor_image = np.zeros((height,width,3))
        for j in range(height):
            for i in range(width):
                fx = sobelx[j,i]
                fy = sobely[j,i]
                tensor_image[j,i] = (fx*fx,fy*fy,fx*fy)
        
        #sigma = 2 * self.sigma * self.sigma     
        #smooth_structure_tensor = cv.GaussianBlur(tensor_image,(kernel_size,kernel_size),sigma)

        gaussian_func = Gaussian.Gaussian()
        smooth_structure_tensor = gaussian_func.calc(tensor_image,2,height,width,channel)
        print("generated smooth structure tensor!")
        self.smooth_structure_tensor = smooth_structure_tensor
        cv.imwrite("./img/smooth_structure_tensor.png",smooth_structure_tensor)
        return smooth_structure_tensor
    
    def cal(self,kernel_size=5):
        if self.type == SST_TYPE.CLASSIC:
            return self.sst_classic(kernel_size)