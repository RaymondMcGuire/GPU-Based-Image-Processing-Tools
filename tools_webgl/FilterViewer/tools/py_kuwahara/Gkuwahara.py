#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Dec  7 16:43:14 2017

@author: raymondmg
"""

import numpy as np
import cv2
import time


def gaussian_kernel(kernel):
    out_kernel = np.zeros((kernel,kernel))
    for i in range(kernel):
        for j in range(kernel):
            out_kernel[i,j] = np.exp(-((i-kernel//2)**2+(j-kernel//2)**2) / (2 * (kernel)**2))
    return out_kernel

def visual_divide(img,height,width,index):
    num = len(index)
    out = np.zeros((num,height,width))
    
    for i in range(num):
        cur_index = index[i]
        for c in cur_index:
            out[i,c[0],c[1]] = img[c[0],c[1]]
    return out
        
def divide_kernel(img,kernel_size,center_point,div):
    h_index = center_point[0]
    w_index = center_point[1]
    rad = kernel_size //2
    angle = 2 * np.pi / div
    
    out = []
    for i in range(div):
        out.append([])
    
    for h in range(h_index-rad,h_index+rad+1):
        for w in range(w_index-rad,w_index+rad+1):
            theta = np.arctan2(h-h_index,w-w_index)
            index = int(np.floor(theta/angle) % div)
            out[index].append((h,w))
    return out

def generalized_kuwahara_filter(image,kernel = 7,q = 3,div = 8):
    pad_size = kernel//2
    gauss_kernel = gaussian_kernel(kernel)
    
    height, width, channel = image.shape
    out_image = image.copy()
    
    pad_image = np.zeros((height+pad_size*2,width+pad_size*2,channel))
    for c in range(channel):
        pad_image[:,:,c] = np.pad(out_image[:,:,c],[pad_size,pad_size],'constant')
        
    for h in range(height):
        for w in range(width):
            for c in range(channel):
                #identify the area 1,2,3,4 range
                #in pad image
                cur_point_index = (h + pad_size,w + pad_size,c)
                div_res = divide_kernel(pad_image[:,:,c],kernel,cur_point_index,div)
                
                
                total_ms = 0
                total_s = 0
                for i in range(div):
                    cur_sum = 0
                    cur_var = 0
                    cur_weight = 0
                    cur_index = div_res[i]
                    for ci in cur_index:
                        g = gauss_kernel[ci[0]-cur_point_index[0]+pad_size,ci[1]-cur_point_index[1]+pad_size]
                        cur_val = pad_image[ci[0],ci[1],c] 
                        cur_sum += cur_val*g
                        cur_var += (cur_val**2)*g
                        cur_weight += g
                    
                    if cur_weight !=0:
                        cur_sum /= cur_weight
                        cur_var /= cur_weight
                    
                    cur_std = cur_var - cur_sum**2
                    
                    if cur_std > 1e-10:
                        cur_std = np.sqrt(cur_std)
                    else:
                        cur_std = 1e-10
                    
                    total_ms += cur_sum * np.power(cur_std,-q)
                    total_s  += np.power(cur_std,-q)
                
                res_val = 0
                if total_s > 1e-10:
                    res_val = total_ms/total_s
                    if res_val>1:
                        out_image[h,w,c] = res_val
    return out_image

img = cv2.imread('./img/demo.jpg')

start = time.time()
out_generalized = generalized_kuwahara_filter(img)
end = time.time()
print('generalized kuwahara filter algo;'+str(end-start))
out_generalized = out_generalized.astype(np.uint8)
cv2.imwrite('./img/out_generalized.jpg',out_generalized)