# -*- coding: utf-8 -*-
"""
Created on Mon Oct  8 12:42:53 2018

@author: raymondmg
"""
import numpy as np

class Gaussian:
    def __init__(self):
        print("init gaussian function!")

    
    def calc(self,image,sigma,height,width,channel=1):
        twoSigma2 = 2.0 * sigma * sigma
        halfKernelSize = int(np.ceil( 2.0 * sigma ))
        
        if channel == 1:
            gaussian_image = np.zeros((height,width))
        else:
            gaussian_image = np.zeros((height,width,channel))
        for j in range(height):
            for i in range(width):
                sumA = [0,0,0]
                w = 0
                for k in range(-halfKernelSize,halfKernelSize+1):
                    for q in range(-halfKernelSize,halfKernelSize+1):
                        iq = i + q
                        jk = j + k
                        if iq >= 0 and jk >= 0 and iq<width and jk < height:
                            r = np.sqrt(k*k+q*q)
                            ww = np.exp(-r*r/twoSigma2)
                            w+=ww
                            if channel == 1:
                                sumA[0]+=ww*image[jk,iq]
                            else:
                                sumA[0]+=ww*image[jk,iq,0]
                                sumA[1]+=ww*image[jk,iq,1]
                                sumA[2]+=ww*image[jk,iq,2]
                if w == 0:
                    w = 1
                if channel == 1:
                    gaussian_image[j,i]  = sumA[0]/w
                else:
                    gaussian_image[j,i,0]  = sumA[0]/w
                    gaussian_image[j,i,1]  = sumA[1]/w
                    gaussian_image[j,i,2]  = sumA[2]/w
        return gaussian_image
    
    def sector_calc(self,kernel_size=32,smoothing=0.3333,N=8):
        sigma = 0.25 * (kernel_size - 1)
        sigma_r = sigma
        sigma_s = smoothing * sigma
        krnl = np.zeros((kernel_size,kernel_size))
        for j in range(kernel_size):
            for i in range(kernel_size):
                x = i - 0.5 * kernel_size + 0.5
                y = j - 0.5 * kernel_size + 0.5
                r = np.sqrt(x * x + y * y)
                
                a = 0.5 * np.arctan2(y, x) / np.pi
                if a > 0.5:
                    a -= 1.0
                if a < -0.5:
                    a += 1.0

                if (np.abs(a) <= 0.5 / N) and (r < 0.5 * kernel_size):
                    krnl[j,i] = 1
                else:
                    krnl[j,i] = 0
                
                    
        g = self.calc(krnl,sigma_s,kernel_size,kernel_size)
        
        mx = 0
        for j in range(kernel_size):
            for i in range(kernel_size):
                x = i - 0.5 * kernel_size + 0.5
                y = j - 0.5 * kernel_size + 0.5
                r = np.sqrt(x * x + y * y)
                
                g[j,i] *= np.exp(-0.5 * r * r / sigma_r / sigma_r)
                if g[j,i] > mx:
                    mx = g[j,i]
        
        for j in range(kernel_size):
            for i in range(kernel_size):
                g[j,i] /=mx
        print("init gaussian function finished!")
        return g