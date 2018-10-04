#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Oct  3 10:51:24 2018

@author: raymondmg
"""

import cv2 as cv
import numpy as np
import multiprocessing

class Field:
    def __init__(self,v2):
        self.v2=v2
    
    def get(self):
        width = 512
        height = 512
        x = self.v2.data[0] - width / 2
        y = self.v2.data[1] - height / 2
        norm = np.sqrt(x * x + y * y)
        
        if norm == 0:
            return Vector2(0, 0)
        
        return Vector2(-y / norm, x / norm)
    

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
        

def RK(p, h):
  v = Field(p).get()
  
  k1 = v.vscale(h)

  v = Field(p.add(k1.scale(0.5))).get()
  k2 = v.vscale(h)

  v = Field(p.add(k2.scale(0.5))).get()
  k3 = v.vscale(h)

  v = Field(p.add(k3)).get()
  k4 = v.vscale(h)

  p = p.add(k1.vscale(1/6).vadd(k2.vscale(1/3)).vadd(k3.vscale(1/3)).vadd(k4.vscale(1/6)))
  
  return p



def computeStreamLine(x,y,L=20,M=10,h=0.5):

  fwd = []
  bwd = []
  f = Vector2(x, y)
  b = Vector2(x, y)

  for i in range(L + M -1): 
    f = RK(f,  h)
    fwd.append(f)
    
    b = RK(b, -h)
    bwd.append(b)
  
  bwd.reverse()
  bwd = bwd + fwd

  for i in range(len(bwd)):
      p = bwd[i]
      bwd[i] = p.vint()

  return bwd

def chkBoundary(v2,width=512,height=512):
    return v2.data[0]>=0 and v2.data[1]>=0 and v2.data[0]<width and v2.data[1]<height
    

def computeStreamLines(image,stream_line,out_image,num_hits,offset=0,L=20,M=10):

    #compute integral for center of streamline
    Ix0 = 0
    k = 0
    l = len(stream_line)
    mid = (l // 2) + offset
    x0 = stream_line[mid]
    for i in range(-L,L):
        xi = stream_line[mid + i]
        if chkBoundary(xi):
            Ix0 += image[xi.data[1],xi.data[0]]
            k+=1
    Ix0 /= k
    out_image[x0.data[1],x0.data[0]] += Ix0 
    num_hits[x0.data[1],x0.data[0]] += 1
    
    IxFwd = Ix0
    IxBwd = Ix0
    #compute integral for left and right points along the streamline
    for i in range(1,M):
        #compute fwd integral
        iFwd = i + mid
        iFwdRight = iFwd + L + 1
        iFwdLeft  = iFwd - L
        xFwd = stream_line[iFwd]
        if iFwdLeft >= 0 and iFwdRight < l:
            xFwdLeft = stream_line[iFwdLeft]
            xFwdRight = stream_line[iFwdRight]
            
            if chkBoundary(xFwdLeft) and chkBoundary(xFwdRight):
                IxFwd += (image[xFwdRight.data[1],xFwdRight.data[0]] - image[xFwdLeft.data[1],xFwdLeft.data[0]]) / k
                out_image[xFwd.data[1],xFwd.data[0]] += IxFwd
                num_hits[xFwd.data[1],xFwd.data[0]]+=1
        #compute bwd integral
        iBwd = -i + mid
        iBwdRight = iBwd - L - 1
        iBwdLeft  = iBwd + L
        xBwd = stream_line[iBwd]

        if iBwdRight >= 0 and iBwdLeft < l:
            xBwdLeft = stream_line[iBwdLeft]
            xBwdRight = stream_line[iBwdRight]
    
            if chkBoundary(xBwdLeft) and chkBoundary(xBwdRight):
                IxBwd += (image[xBwdRight.data[1],xBwdRight.data[0]] - image[xBwdLeft.data[1],xBwdLeft.data[0]]) / k
                out_image[xBwd.data[1],xBwd.data[0]] += IxBwd
                num_hits[xBwd.data[1],xBwd.data[0]]+=1
    return out_image,num_hits

def computeLIC(image):
    out_image = np.zeros((512,512))
    num_hits = np.zeros((512,512))
    minNumHits = 5
    w2 = int(512 / 2)
    h2 = int(512 / 2)
    for i in range(w2*h2):
        print("progress:"+str(100*i/(w2*h2))+"%")
        p1x = i % w2
        p1y = i // w2
        p2x = (i % w2) + w2
        p2y = p1y
        p3x = p1x
        p3y = (i // w2) + h2
        p4x = p2x
        p4y = p3y
        if num_hits[p1y,p1x] < minNumHits:
            streamLine = computeStreamLine(p1x, p1y)
            out_image,num_hits = computeStreamLines(image,streamLine,out_image,num_hits)
        
        if num_hits[p2y,p2x] < minNumHits:
            streamLine = computeStreamLine(p2x, p2y)
            out_image,num_hits = computeStreamLines(image,streamLine,out_image,num_hits)

        if num_hits[p3y,p3x] < minNumHits:
            streamLine = computeStreamLine(p3x, p3y)
            out_image,num_hits = computeStreamLines(image,streamLine,out_image,num_hits)

        if num_hits[p4y,p4x] < minNumHits:
            streamLine = computeStreamLine(p4x, p4y)
            out_image,num_hits = computeStreamLines(image,streamLine,out_image,num_hits)
            
    for j in range(512):
        for i in range(512):
            if num_hits[j,i] != 0:
                out_image[j,i] /= num_hits[j,i]
    
    out_rgb_image = np.zeros((512,512,3))
    for j in range(512):
        for i in range(512):
            gray = int(out_image[j,i]*255)
            out_rgb_image[j,i] =(gray,gray,gray) 
    return out_rgb_image


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

EPS = 1e-10
INF = 1e10
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
    direct = [INF]
    if sign(p2[0]) != 0:
        d1 = (np.ceil(p1[0])-p1[0])/(np.abs(p2[0])+EPS)
        d2 = (p1[0]-np.floor(p1[0]))/(np.abs(p2[0])+EPS)
        if sign(d1) >0:
            direct.append(d1)
        if sign(d2) >0:
            direct.append(d2)
    else:
        direct.append(INF)
        
    if sign(p2[1]) != 0:
        d3 = (np.ceil(p1[1])-p1[1])/(np.abs(p2[1])+EPS)
        d4 = (p1[1]-np.floor(p1[1]))/(np.abs(p2[1])+EPS)
        if sign(d3) >0:
            direct.append(d3)
        if sign(d4) >0:
            direct.append(d4)
    else:
        direct.append(INF)
        
    minVal = np.min(direct)
    
    if minVal > 2:
        return nextPoint( [p1[0] + 0.1 * p2[0],p1[1] + 0.1 * p2[1]],p2)
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
    pcnt=0
    for it in range(2):
        for j in range(startIdx,endIdx):
            for i in range(image.shape[1]):
                weight = 0
                vx = vf_image[j,i,0]
                vy = vf_image[j,i,1]
                pcnt+=1
                print("current process:"+str(round(100*pcnt/(image.shape[1]*(endIdx-startIdx)),2)))
                for pm in range(-1,2,2):
                    l = 0
                    cnt = 0
                    pt = [i+0.5,j+0.5]
                   
                    while l < L and cnt<100:
                        cnt+=1
                        lx = np.ceil(pt[0])
                        ly = np.ceil(pt[1])
                        if lx<0 or ly<0 or lx >= image.shape[1] or ly>= image.shape[0]:
                            break

                        if sign(vx) == 0 and sign(vy) == 0:
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

def demoTensor():
    sst = np.zeros((512,512,3))
    vfield = np.zeros((512,512,2))
    for j in range(512):
        for i in range(512):
            dx = (i - 255)/ 100
            dy = (j - 255)/ 100
            E = dx*dx - dy*dy
            F = -2 * dx* dy
            sst[j,i,0] = E
            sst[j,i,1] = F
            sst[j,i,2] = E
    sst = cv.GaussianBlur(sst,(7,7),3.0)
    for j in range(512):
        for i in range(512):
            E = sst[j,i,0]
            F = sst[j,i,1]
            G = sst[j,i,2]
            lambdaVal = (E + G + np.sqrt((E - G) * (E - G) + 4.0 * F * F)) / 2.0
            vfield[j,i,0] = lambdaVal - E
            vfield[j,i,1] = -F
    return vfield
"""
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


vfield_image = demoTensor()
print("tensor calculated finished!")

rnd_image = randomNoise([512,512,3])
cv.imwrite("./img/rnd_image.png",rnd_image)

args = (rnd_image,vfield_image,30,0,512)
lic_image = lic(args)
cv.imwrite("./img/lic_image.png",lic_image)
print("generated LIC!")
"""
vfield_image = demoTensor()

