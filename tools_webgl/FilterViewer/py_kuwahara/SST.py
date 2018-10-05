#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Oct  3 10:51:24 2018

@author: raymondmg
"""

import cv2 as cv
import numpy as np
from enum import Enum

class SST_TYPE(Enum):
    CLASSIC = 1


class SST:
    def __init__(self,image,type):
        self.type = type
        self.image = image
    def sst_classic(self,kernel_size=5,tau=0.002,box_filter = [[1,0],[-1,0],[0,1],[0,-1]],iter=5):
        img = self.image
        gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        height,width,_ = img.shape

        sobelx = cv.Sobel(gray, cv.CV_32F, 1, 0, ksize=kernel_size)
        sobely = cv.Sobel(gray, cv.CV_32F, 0, 1, ksize=kernel_size)

        cv.imwrite("./img/sobelx.png",sobelx)
        cv.imwrite("./img/sobely.png",sobely)

        tensor_image = np.zeros((height,width,3))
        for j in range(height):
            for i in range(width):
                fx = sobelx[j,i]
                fy = sobely[j,i]
                tensor_image[j,i] = (fx*fx,fx*fy,fy*fy)
        cv.imwrite("./img/tensor_image.png",tensor_image)
        
        structure_tensor_image = np.zeros((height,width,3))
        for t in range(iter):
            for j in range(height):
                for i in range(width):
                    E = tensor_image[j,i,0]
                    F = tensor_image[j,i,1]
                    G = tensor_image[j,i,2]
                    eng = np.sqrt(E*E+2*F*F+G*G)
                    if eng>tau:
                        sumE = 0
                        sumF = 0
                        sumG = 0
                        cnt = 0
                        for idx in range(len(box_filter)):
                            xx = box_filter[idx][0] + i
                            yy = box_filter[idx][1] + j
                            if yy <height  and yy>=0 and xx<width and xx>=0:
                                sumE += tensor_image[yy,xx,0]
                                sumF += tensor_image[yy,xx,1]
                                sumG += tensor_image[yy,xx,2]
                                cnt+=1
                        structure_tensor_image[j,i,0]= sumE/cnt
                        structure_tensor_image[j,i,1]= sumF/cnt
                        structure_tensor_image[j,i,2]= sumG/cnt
                    else:
                        structure_tensor_image[j,i] = tensor_image[j,i]
            tensor_image =  structure_tensor_image
        cv.imwrite("./img/structure_tensor_image.png",structure_tensor_image)

        sigma = 2 * kernel_size * kernel_size 
        smooth_structure_tensor = cv.GaussianBlur(structure_tensor_image,(kernel_size,kernel_size),sigma)
        cv.imwrite("./img/smooth_structure_tensor.png",smooth_structure_tensor)
        print("generated smooth structure tensor!")
        self.smooth_structure_tensor = smooth_structure_tensor
        return smooth_structure_tensor
    
    def cal(self):
        if self.type == SST_TYPE.CLASSIC:
            return self.sst_classic()