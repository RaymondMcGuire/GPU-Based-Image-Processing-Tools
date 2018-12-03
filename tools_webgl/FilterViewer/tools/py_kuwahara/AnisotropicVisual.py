# -*- coding: utf-8 -*-
"""
Created on Sun Oct  7 18:39:00 2018

@author: raymondmg
"""
import numpy as np
import SST
import cv2 as cv

class AnisotropicKuwahara:
    def __init__(self,image,sst,kernel_size=7,div_num=8,q=8.0,alpha=1.0):
        self.sst = sst
        self.kernel_size = kernel_size
        self.image = image
        self.div_num = div_num
        self.angle = 2 * np.pi/div_num
        self.q = q
        self.alpha = alpha
        self.height = image.shape[0]
        self.width = image.shape[1]
        self.channel = image.shape[2]
        self.param_anisotropy()
    
    def param_anisotropy(self):
        visual_image = cv.imread("./img/visual_rgb.png") 
        anisotropic_image = np.zeros((self.height,self.width,self.channel))
        A = np.zeros((self.height,self.width))
        PHI = np.zeros((self.height,self.width))
        for j in range(self.height):
            for i in range(self.width):
                E = self.sst[j,i,0]
                G = self.sst[j,i,1]
                F = self.sst[j,i,2]
                D = np.sqrt((E-G)*(E-G)+4.0*F*F)
                
                lambda1 = (E + G + D)/2.0
                lambda2 = (E + G - D)/2.0
                
                if (lambda1 + lambda2) <=0:
                    A[j,i] = 0
                else:
                    A[j,i] = (lambda1 - lambda2)/(lambda1 + lambda2)
                
                #visualization Anisotropic
                anisotropic_image[j,i,0] = visual_image[0,int(255*A[j,i]),0]
                anisotropic_image[j,i,1] = visual_image[0,int(255*A[j,i]),1]
                anisotropic_image[j,i,2] = visual_image[0,int(255*A[j,i]),2]
                     
                PHI[j,i] = np.arctan2(-F, lambda1 - E)

        self.A = A
        self.PHI = PHI
        cv.imwrite("./img/anisotropic_image.png",anisotropic_image)    
        return anisotropic_image
        
img = cv.imread('./img/anim.png')
sst_func = SST.SST(img,SST.SST_TYPE.CLASSIC)
sst_image = sst_func.cal(5)
       
aniso_kuwahara_func = AnisotropicKuwahara(img,sst_image)
anisotropic_image = aniso_kuwahara_func.param_anisotropy()
  

