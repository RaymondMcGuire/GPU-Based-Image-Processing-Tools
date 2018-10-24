#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Oct  5 16:41:54 2018

@author: raymondmg
"""
import numpy as np

class Vector2:
    def __init__(self,x,y):
        self.data = [x,y]
    
    def add(self,v):
        return Vector2(self.data[0]+v.data[0],self.data[1]+v.data[1])
    
    def scale(self,s):
        return Vector2(self.data[0]*s,self.data[1]*s)
    
    def vscale(self,s):
        self.data = [self.data[0]*s,self.data[1]*s]
        return self
   
    def vadd(self,v):
        self.data = [self.data[0]+v.data[0],self.data[1]+v.data[1]]
        return self
    
    def vint(self):
        self.data = [int(self.data[0]),int(self.data[1])]
        return self

def demoTensor():
    vfield = np.zeros((512,512,2))
    for j in range(512):
        for i in range(512):
            x = i - int(512 / 2)
            y = j - int(512 / 2)
            norm = np.sqrt(x**2+y**2)
            if norm == 0:
                vfield[j,i,0] = 0
                vfield[j,i,1] = 0
            else:
                vfield[j,i,0] = -y/norm
                vfield[j,i,1] = x/norm                
    return vfield

def randomNoise(height,width,flag_visual=False):
    if flag_visual:
        random_image = np.zeros((height,width,3))
        for j in range(height):
            for i in range(width):
                val = int(np.random.rand()*255)
                random_image[j,i,0] = val
                random_image[j,i,1] = val
                random_image[j,i,2] = val
    else:
        random_image = np.zeros((height,width))
        for j in range(height):
            for i in range(width):
                val = np.random.rand()
                random_image[j,i] = val      
    return random_image