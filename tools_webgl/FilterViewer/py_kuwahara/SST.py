#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Oct  3 10:51:24 2018

@author: raymondmg
"""

import cv2 as cv
import numpy as np
import multiprocessing

def randomNoise(shape):
    random_image = np.zeros(shape)
    for j in range(shape[0]):
        for i in range(shape[1]):
            val = np.random.rand()*255
            for c in range(shape[2]):
                random_image[j,i,c] = val
    return random_image

EPS = 1e-6
def sign(val) :
    if val < -EPS:
        return -1
    if val >  EPS:
        return  1
    return 0


cc = 10.0
dd = 5.0
beta = np.pi/8.0
def intkw(aa, bb):
    return 0.25 * (bb - aa + (np.sin(bb * cc) - np.sin(aa * dd)) / cc
        + (np.sin(dd * bb + beta) - np.sin(aa * dd + beta)) / dd
        + (np.sin(bb * (cc - dd) - beta) - np.sin(aa * (cc - dd) - beta)) / (2.0 * (cc - dd))
        + (np.sin(bb * (cc + dd) + beta) - np.sin(aa * (cc + dd) + beta)) / (2.0 * (cc + dd)))
    
def nextPoint(p1,p2):
    direct = []
    if sign(p2[0]) != 0:
        direct.append((np.ceil(p1[0])-p1[0])/np.abs(p2[0]))
        direct.append(p1[0]-(np.floor(p1[0]))/np.abs(p2[0]))
    if sign(p2[1]) != 0:
        direct.append((np.ceil(p1[1])-p1[1])/np.abs(p2[1]))
        direct.append(p1[1]-(np.floor(p1[1]))/np.abs(p2[1]))
    minVal = np.min(direct)
    if minVal > 2:
        p1[0] += p2[0]*0.1
        p1[1] += p2[1]*0.1
        return nextPoint(p1,p2)
    return [p1[0] + minVal * p2[0],p1[1] + minVal * p2[1]]


total_blocks_num = 200
def lic(args):
    image = args[0]
    vf_image = args[1]
    L = args[2]
    startIdx = args[3]
    endIdx = args[4]
    
    print("process range:"+str(startIdx)+"~"+str(endIdx))
    lic_image = np.zeros((image.shape))
    for it in range(2):
        for j in range(startIdx,endIdx):
            for i in range(width):
                weight = 0
                for pm in range(-1,2,2):
                    l = 0
                    cnt = 0
                    pt = [i+0.5,j+0.5]
                    while l < L and cnt<100:
                        cnt+=1
                        lx = np.ceil(pt[0])
                        ly = np.ceil(pt[1])
                        if lx<0 or ly<0 or lx >= width or ly>= height:
                            break
                        vx = vf_image[j,i,0]
                        vy = vf_image[j,i,1]
                        if vx == 0 and vy ==0:
                            break
                        npt = nextPoint(pt,[pm*vx,pm*vy])
                        distance = np.sqrt((npt[0]-pt[0])**2+(npt[1]-pt[1])**2)
                        h = intkw(l,l+distance)
                        lic_image[j,i,0] += image[j,i,0]*h
                        lic_image[j,i,1] += image[j,i,1]*h
                        lic_image[j,i,2] += image[j,i,2]*h
                        weight+=h
                        l+=distance
                        pt = npt
                if weight!=0:
                    lic_image[j,i,0] /= weight
                    lic_image[j,i,1] /= weight
                    lic_image[j,i,2] /= weight
                else:
                    lic_image[j,i,0] = image[j,i,0]
                    lic_image[j,i,1] = image[j,i,1]
                    lic_image[j,i,2] = image[j,i,2]                    
                        
    return lic_image

def multiprocess_lic(image,vf_image,L):
    lic_image = np.zeros((image.shape))
    
    def create_blocks(num):
        args = []
        nHeight = (image.shape[0]//num)+1
        realNumber = image.shape[0]//nHeight
        for n in range(realNumber-1):
            args.append((image,vf_image,L,n*nHeight,(n+1)*nHeight))
        args.append((image,vf_image,L,(realNumber-1)*nHeight,image.shape[0]-1))
        return args
    
    args = create_blocks(total_blocks_num)
    cores = multiprocessing.cpu_count()
    pool = multiprocessing.Pool(processes=cores)
    out_image_list = pool.map(lic,args)
    for i in range(len(args)):
        lic_image[args[i][3]:args[i][4]] = out_image_list[i][args[i][3]:args[i][4]]
    return lic_image

kernel_size = 11

img = cv.imread('./img/demo.png')
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
height,width,_ = img.shape

sobelx = cv.Sobel(gray, cv.CV_32F, 1, 0, ksize=kernel_size)
sobely = cv.Sobel(gray, cv.CV_32F, 0, 1, ksize=kernel_size)

cv.imwrite("./img/sobelx.png",sobelx)
cv.imwrite("./img/sobely.png",sobely)

tensor_image = np.zeros((height,width,3))
structure_tensor_image = np.zeros((height,width,3))
for j in range(height):
    for i in range(width):
        fx = sobelx[j,i]
        fy = sobely[j,i]
        tensor_image[j,i] = (fx*fx,fx*fy,fy*fy)

cv.imwrite("./img/tensor_image.png",tensor_image)

tau = 0.002
box_filter = [[1,0],[-1,0],[0,1],[0,-1]]

for t in range(5):
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
print("generated sst!")

vfield_image = np.zeros((height,width,2))
for j in range(height):
    for i in range(width):
        E = smooth_structure_tensor[j,i,0]
        F = smooth_structure_tensor[j,i,1]
        G = smooth_structure_tensor[j,i,2]
        D = np.sqrt((E-G)*(E-G)+4.0*F*F)
        lambda1 = (E + G + D) / 2.0
        lambda2 = (E + G - D) / 2.0 
        theta = np.arctan2(-F, lambda1 - E)
        vfield_image[j,i,0] = 2 * np.cos(theta)
        vfield_image[j,i,1] = 2 * np.sin(theta)

print("generated vector field!")
rnd_image = randomNoise([height,width,3])
cv.imwrite("./img/rnd_image.png",rnd_image)

lic_image = multiprocess_lic(rnd_image,vfield_image,20)
cv.imwrite("./img/lic_image.png",lic_image)
print("generated LIC!")