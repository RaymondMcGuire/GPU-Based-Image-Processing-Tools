# -*- coding: utf-8 -*-
"""
Created on Thu Oct  4 18:18:06 2018

@author: g-xu-wang
"""

import cv2 as cv
import numpy as np

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
    
    def getdemo(self,vfield):
        if int(self.v2.data[1])>=512 or int(self.v2.data[0]>=512) or int(self.v2.data[1])<0 or int(self.v2.data[1])<0:
            return Vector2(0, 0)
        else:  
            val = vfield[int(self.v2.data[1]),int(self.v2.data[0])]
            return Vector2(val[0],val[1])
        
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
        

def RK(vfield_image,p, h):
  v = Field(p).getdemo(vfield_image)
  
  k1 = v.vscale(h)

  v = Field(p.add(k1.scale(0.5))).getdemo(vfield_image)
  k2 = v.vscale(h)

  v = Field(p.add(k2.scale(0.5))).getdemo(vfield_image)
  k3 = v.vscale(h)

  v = Field(p.add(k3)).getdemo(vfield_image)
  k4 = v.vscale(h)

  p = p.add(k1.vscale(1/6).vadd(k2.vscale(1/3)).vadd(k3.vscale(1/3)).vadd(k4.vscale(1/6)))
  
  return p



def computeStreamLine(vfield_image,x,y,L=20,M=10,h=0.5):

  fwd = []
  bwd = []
  f = Vector2(x, y)
  b = Vector2(x, y)

  for i in range(L + M -1): 
    f = RK(vfield_image,f,  h)
    fwd.append(f)
    
    b = RK(vfield_image,b, -h)
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

def computeLIC(image,vfield_image):
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
            streamLine = computeStreamLine(vfield_image,p1x, p1y)
            out_image,num_hits = computeStreamLines(image,streamLine,out_image,num_hits)
        
        if num_hits[p2y,p2x] < minNumHits:
            streamLine = computeStreamLine(vfield_image,p2x, p2y)
            out_image,num_hits = computeStreamLines(image,streamLine,out_image,num_hits)

        if num_hits[p3y,p3x] < minNumHits:
            streamLine = computeStreamLine(vfield_image,p3x, p3y)
            out_image,num_hits = computeStreamLines(image,streamLine,out_image,num_hits)

        if num_hits[p4y,p4x] < minNumHits:
            streamLine = computeStreamLine(vfield_image,p4x, p4y)
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


rnd_image = randomNoise(512,512)
vfield_image = demoTensor()
lic_image = computeLIC(rnd_image,vfield_image)
cv.imwrite("./img/lic_image.png",lic_image)