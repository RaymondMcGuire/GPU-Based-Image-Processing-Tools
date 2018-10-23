# -*- coding: utf-8 -*-
"""
Created on Sun Oct  7 18:39:00 2018

@author: raymondmg
"""
import numpy as np
import SST
import Gaussian as ga
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
                
                A[j,i] = 1
                #visualization Anisotropic
                anisotropic_image[j,i,0] = visual_image[0,int(255*A[j,i]),0]
                anisotropic_image[j,i,1] = visual_image[0,int(255*A[j,i]),1]
                anisotropic_image[j,i,2] = visual_image[0,int(255*A[j,i]),2]
                     
                PHI[j,i] = np.arctan2(-F, lambda1 - E)

        self.A = A
        self.PHI = PHI
        cv.imwrite("./img/anisotropic_image.png",anisotropic_image)    
        
    
    def calc(self):
        anisotropic_kuwahara_image = np.zeros((self.height,self.width,self.channel))
        cnt = 0
        cnt_list = []
        EPS = 1e-6

        for j in range(self.height):
            for i in range(self.width):
                cnt += 1
            
                num_count = round(100*cnt/(self.height*self.width),0)
                
                if num_count not in cnt_list:
                    cnt_list.append(num_count)
                    print("current progress:"+str(num_count)+"%")
                
                v_sum = np.zeros((self.div_num,3))
                v_var = np.zeros((self.div_num,3))
                v_weight = np.zeros(self.div_num)
                
                aniso = self.A[j,i]
                theta = -self.PHI[j,i]
                sx = self.alpha / (aniso + self.alpha)
                sy = (self.alpha + aniso) / self.alpha
                
                for dy in range(-self.kernel_size,self.kernel_size+1):
                    for dx in range(-self.kernel_size,self.kernel_size+1):
                        if dx==0 and dy == 0:
                            continue
                        dx2 = int(sx * (np.cos(theta) * dx - np.sin(theta) * dy))
                        dy2 = int(sy * (np.sin(theta) * dx + np.cos(theta) * dy))
                        xx = i+dx2
                        yy = j+dy2
                        if xx>=0 and yy>=0 and xx<self.width and yy<self.height:
                            theta = np.arctan2(dy2, dx2) + np.pi
                            k = int(np.floor(theta / self.angle)) % self.div_num
                            d2 = dx2 * dx2 + dy2 * dy2
                            g = np.exp(-d2 / (2.0 * self.kernel_size))
                            oB = self.image[yy,xx,0]
                            oG = self.image[yy,xx,1]
                            oR = self.image[yy,xx,2]
                            v_sum[k,0] += g * oB
                            v_sum[k,1] += g * oG
                            v_sum[k,2] += g * oR
                            v_var[k,0] += g * oB * oB
                            v_var[k,1] += g * oG * oG
                            v_var[k,2] += g * oR * oR
                            v_weight[k] += g
                                    
                                    
                de = np.zeros(3)
                nu = np.zeros(3)
                for d in range(self.div_num):
                    if v_weight[d]!=0:
                        v_sum[d,0] = v_sum[d,0]/v_weight[d]
                        v_sum[d,1] = v_sum[d,1]/v_weight[d]
                        v_sum[d,2] = v_sum[d,2]/v_weight[d]
                        
                        v_var[d,0] = v_var[d,0]/v_weight[d]
                        v_var[d,1] = v_var[d,1]/v_weight[d]
                        v_var[d,2] = v_var[d,2]/v_weight[d]
                    else:
                        v_sum[d,0] = 0
                        v_var[d,0] = 0       
                        
                        v_sum[d,1] = 0
                        v_var[d,1] = 0    
                        
                        v_sum[d,2] = 0
                        v_var[d,2] = 0    

                    v_var[d,0] = np.abs(v_var[d,0] - v_sum[d,0] * v_sum[d,0]) 
                    v_var[d,1] = np.abs(v_var[d,1] - v_sum[d,1] * v_sum[d,1]) 
                    v_var[d,2] = np.abs(v_var[d,2] - v_sum[d,2] * v_sum[d,2])                     
                    
                    if v_var[d,0] > EPS:
                        v_var[d,0] = np.sqrt(v_var[d,0])
                    else:
                        v_var[d,0] = EPS
                        
                    if v_var[d,1] > EPS:
                        v_var[d,1] = np.sqrt(v_var[d,1])
                    else:
                        v_var[d,1] = EPS
                    
                    if v_var[d,2] > EPS:
                        v_var[d,2] = np.sqrt(v_var[d,2])
                    else:
                        v_var[d,2] = EPS
                        
                    w0 = 1/(1 + np.power(v_var[d,0],self.q))
                    w1 = 1/(1 + np.power(v_var[d,1],self.q))
                    w2 = 1/(1 + np.power(v_var[d,2],self.q))
                    
                    de[0] += w0 * v_sum[d,0]
                    de[1] += w1 * v_sum[d,1]
                    de[2] += w2 * v_sum[d,2]
                    
                    nu[0] += w0
                    nu[1] += w1
                    nu[2] += w2
                    
                    
                if nu[0] > EPS:
                    valB = de[0]/nu[0]
                else:
                    valB = self.image[j,i,0]
                
                if nu[1] > EPS:
                    valG = de[1]/nu[1]
                else:
                    valG = self.image[j,i,1]
                    
                if nu[2] > EPS:
                    valR = de[2]/nu[2]
                else:
                    valR = self.image[j,i,2]
                
                anisotropic_kuwahara_image[j,i,0] = int(valB)
                anisotropic_kuwahara_image[j,i,1] = int(valG)
                anisotropic_kuwahara_image[j,i,2] = int(valR)
        self.res_image = anisotropic_kuwahara_image
        return anisotropic_kuwahara_image


#img = cv.imread('./img/anim.png')
#sst_func = SST.SST(img,SST.SST_TYPE.CLASSIC)
#sst_image = sst_func.cal(9)

gaussian_func = ga.Gaussian()
gfilter = gaussian_func.sector_calc(32)
cv.imwrite("./img/k0.png",gfilter)         
#aniso_kuwahara_func = AnisotropicKuwahara(img,sst_image)
#aniso_kuwahara_image = aniso_kuwahara_func.calc()
#cv.imwrite("./img/aniso_kuwahara_image.png",aniso_kuwahara_image)         

