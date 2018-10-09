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
    def __init__(self,image,sst,kernel_size=6,div_num=8,q=8.0,alpha=1.0):
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
        A = np.zeros((self.height,self.width))
        PHI = np.zeros((self.height,self.width))
        for j in range(self.height):
            for i in range(self.width):
                E = self.sst[j,i,0]
                F = self.sst[j,i,1]
                G = self.sst[j,i,2]
                D = np.sqrt((E-G)*(E-G)+4.0*F*F)
                
                lambda1 = (E + G + D)/2.0
                lambda2 = (E + G - D)/2.0
                
                if lambda1 + lambda2 == 0:
                    A[j,i] = 0
                else:
                    A[j,i] = (lambda1 - lambda2)/(lambda1 + lambda2)
                
                if A[j,i] < 0:
                    A[j,i] = 0
                elif A[j,i] > 1:
                    A[j,i] = 1
                
                lengthV = np.sqrt(F*F+( lambda1 - E)**2)
                    
                PHI[j,i] = np.arctan2(-F/lengthV, (lambda1 - E)/lengthV)
        self.A = A
        self.PHI = PHI
        
    
    def calc(self,gfilter):
        anisotropic_kuwahara_image = np.zeros((self.height,self.width,self.channel))
        cnt = 0
        cnt_list = []
        for c in range(self.channel):
            for j in range(self.height):
                for i in range(self.width):
                    cnt += 1
                
                    num_count = round(100*cnt/(self.channel*self.height*self.width),0)
                    
                    if num_count not in cnt_list:
                        cnt_list.append(num_count)
                        print("current progress:"+str(num_count)+"%")
                    
                    v_sum = np.zeros(self.div_num)
                    v_var = np.zeros(self.div_num)
                    v_weight = np.zeros(self.div_num)
                    
                    aniso = self.A[j,i]
                    a =  self.kernel_size * np.clip((aniso+self.alpha)/self.alpha,0.1,2.0)
                    b =  self.kernel_size * np.clip(self.alpha/(aniso+self.alpha),0.1,2.0)
                    
                    theta = self.PHI[j,i]
                    cos_phi = np.cos(theta)
                    sin_phi = np.sin(theta)
                    #theta = -self.PHI[j,i]
                    rotMat = np.array([[np.cos(self.angle),-np.sin(self.angle)],[np.sin(self.angle),np.cos(self.angle)]])
                    S = np.array([[0.5/a, 0.0],[0.0, 0.5/b]])
                    R =np.array([[cos_phi, sin_phi], [-sin_phi, cos_phi]])
                    SR = np.dot(S,R)
                    
                    max_x = int(np.sqrt(a*a * cos_phi*cos_phi + b*b * sin_phi*sin_phi))
                    max_y = int(np.sqrt(a*a * sin_phi*sin_phi + b*b * cos_phi*cos_phi))
                    for dy in range(-max_y,max_y+1):
                        for dx in range(-max_x,max_x+1):
                            v = np.dot(SR,np.array([dx,dy]))
                            if np.dot(v,v) <=0.25:
                                xx = i+dx
                                yy = j+dy
                                if xx>=0 and yy>=0 and xx<self.width and yy<self.height:
                                    o = self.image[yy,xx,c]
                                    for k in range(self.div_num):
                                        gidx = int((np.array([[0.5],[0.5]]) + v)[0,0] * 13)
                                        gidy = int((np.array([[0.5],[0.5]]) + v)[1,0] * 13)
                                        g = gfilter[gidy,gidx]
                                        v_sum[k] += g * o
                                        v_var[k] += g * o * o
                                        v_weight[k] += g
                                        
                                        v = np.dot(v,rotMat)
                    """
                    for dy in range(-self.kernel_size,self.kernel_size+1):
                        for dx in range(-self.kernel_size,self.kernel_size+1):
                            
                            
                            if dx == 0 and dy == 0:
                                continue
                            dx2 = int(sx*(np.cos(theta) * dx - np.sin(theta) * dy))
                            dy2 = int(sy*(np.sin(theta) * dx + np.cos(theta) * dy))
                            xx = i + dx2
                            yy = j + dy2
                            if xx>=0 and yy>=0 and xx<self.width and yy<self.height:
                                theta = np.arctan2(dy2,dx2) + np.pi
                                t = int(np.floor(theta/self.angle)) % self.div_num
                                d2 = dx2 * dx2 + dy2 * dy2
                                #g = np.exp(-d2 / (2.0*self.kernel_size))
                                g = gfilter[dy+self.kernel_size,dx+self.kernel_size]
                                v = self.image[yy,xx,c]
                                v_sum[t] += g * v
                                v_var[t] += g * v * v
                                v_weight[t] += g
                    """
                    
                    de = 0.0
                    nu = 0.0
                    for d in range(self.div_num):
                        if v_weight[d]!=0:
                            v_sum[d] = v_sum[d]/v_weight[d]
                            v_var[d] = v_var[d]/v_weight[d]
                        else:
                            v_sum[d] = 0
                            v_var[d] = 0                

                        v_var[d] = np.abs(v_var[d] - v_sum[d] * v_sum[d])                     
                        if v_var[d] > 1e-10:
                            v_var[d] = np.sqrt(v_var[d])
                        else:
                            v_var[d] = 1e-10
                        w = 1.0 / (1.0 + np.power(v_var[d],self.q))
                        de += w * v_sum[d]
                        nu += w
                    if nu > 1e-10:
                        val = de/nu
                    else:
                        val = self.image[j,i,c]
                    
                    anisotropic_kuwahara_image[j,i,c] = int(val)
        self.res_image = anisotropic_kuwahara_image
        return anisotropic_kuwahara_image

img = cv.imread('./img/anim.png')
sst_func = SST.SST(img,SST.SST_TYPE.CLASSIC)
sst_image = sst_func.cal(9)

gaussian_func = ga.Gaussian()
gfilter = gaussian_func.sector_calc(13)

aniso_kuwahara_func = AnisotropicKuwahara(img,sst_image)
aniso_kuwahara_image = aniso_kuwahara_func.calc(gfilter)
cv.imwrite("./img/aniso_kuwahara_image.png",aniso_kuwahara_image)                