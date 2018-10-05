#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Oct  5 16:20:59 2018

@author: raymondmg
"""
import numpy as np
import Vector as v

class VectorField:
    def __init__(self,sst):
        self.sst = sst
        
    def DemoVectorField(self,vec):
        width = 512
        height = 512
        x = vec.data[0] - width / 2
        y = vec.data[1] - height / 2
        norm = np.sqrt(x * x + y * y)
        
        if norm == 0:
            return v.Vector2(0, 0)
        
        return v.Vector2(-y / norm, x / norm)
    
    def GetVectorFieldValByCoord(self,vec):
        y = int(round(vec.data[1]))
        x = int(round(vec.data[0]))
        
        if y>= self.vfield_image.shape[0]:
            y -= self.vfield_image.shape[0]
        if x>=self.vfield_image.shape[1]:
            x -=self.vfield_image.shape[1]
        
        val = self.vfield_image[y,x]
        return v.Vector2(val[0],val[1])
        
        
    def cal(self):
        height,width,_ = self.sst.shape
        smooth_structure_tensor = self.sst
        vfield_image = np.zeros((height,width,2))
        for j in range(height):
            for i in range(width):
                E = smooth_structure_tensor[j,i,0]
                F = smooth_structure_tensor[j,i,1]
                G = smooth_structure_tensor[j,i,2]
                D = np.sqrt((E-G)*(E-G)+4.0*F*F)
                lambda1 = (E + G + D) / 2.0
                theta = np.arctan2(-F, lambda1 - E)
                vfield_image[j,i,0] = np.cos(theta)
                vfield_image[j,i,1] = np.sin(theta)
        print("generated vector field!")
        self.vfield_image=vfield_image
        return vfield_image