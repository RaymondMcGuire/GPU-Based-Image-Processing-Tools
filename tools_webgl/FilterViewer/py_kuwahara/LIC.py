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
        y = int(round(self.v2.data[1]))
        x = int(round(self.v2.data[0]))
        
        if y>= vfield.shape[0]:
            y -= vfield.shape[0]
        if x>=vfield.shape[1]:
            x -=vfield.shape[1]
        
        val = vfield[y,x]
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
  #v = Field(p).get()
  k1 = v.vscale(h)
  
  #v = Field(p.add(k1.scale(0.5))).get()
  v = Field(p.add(k1.scale(0.5))).getdemo(vfield_image)
  k2 = v.vscale(h)
  
  v = Field(p.add(k2.scale(0.5))).getdemo(vfield_image)
  #v = Field(p.add(k2.scale(0.5))).get()
  k3 = v.vscale(h)

  v = Field(p.add(k3)).getdemo(vfield_image)
  #v = Field(p.add(k3)).get()
  k4 = v.vscale(h)
  p = p.add(k1.vscale(1/6).vadd(k2.vscale(1/3)).vadd(k3.vscale(1/3)).vadd(k4.vscale(1/6)))
  
  x = p.data[0]
  y = p.data[1]
  if y>= vfield_image.shape[0]:
    y -= vfield_image.shape[0]
  if x>=vfield_image.shape[1]:
      x -=vfield_image.shape[1]

  return Vector2(x,y)



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
    height,width,channel = image.shape
    #compute integral for center of streamline
    Ix0 = [0,0,0]
    k = 0
    l = len(stream_line)
    mid = (l // 2) + offset
    x0 = stream_line[mid]
    for i in range(-L,L):
        xi = stream_line[mid + i]
        if chkBoundary(xi,width,height):
            Ix0[0] += image[xi.data[1],xi.data[0],0]
            Ix0[1] += image[xi.data[1],xi.data[0],1]
            Ix0[2] += image[xi.data[1],xi.data[0],2]
            k+=1
    Ix0[0] /= k
    Ix0[1] /= k
    Ix0[2] /= k
    out_image[x0.data[1],x0.data[0],0] += Ix0[0]
    out_image[x0.data[1],x0.data[0],1] += Ix0[1]
    out_image[x0.data[1],x0.data[0],2] += Ix0[2]
    num_hits[x0.data[1],x0.data[0],0] += 1
    num_hits[x0.data[1],x0.data[0],1] += 1
    num_hits[x0.data[1],x0.data[0],2] += 1
    
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
            
            if chkBoundary(xFwdLeft,width,height) and chkBoundary(xFwdRight,width,height):
                IxFwd[0] += (image[xFwdRight.data[1],xFwdRight.data[0],0] - image[xFwdLeft.data[1],xFwdLeft.data[0],0]) / k
                IxFwd[1] += (image[xFwdRight.data[1],xFwdRight.data[0],1] - image[xFwdLeft.data[1],xFwdLeft.data[0],1]) / k
                IxFwd[2] += (image[xFwdRight.data[1],xFwdRight.data[0],2] - image[xFwdLeft.data[1],xFwdLeft.data[0],2]) / k
                out_image[xFwd.data[1],xFwd.data[0],0] += IxFwd[0]
                out_image[xFwd.data[1],xFwd.data[0],1] += IxFwd[1]
                out_image[xFwd.data[1],xFwd.data[0],2] += IxFwd[2]
                num_hits[xFwd.data[1],xFwd.data[0],0]+=1
                num_hits[xFwd.data[1],xFwd.data[0],1]+=1
                num_hits[xFwd.data[1],xFwd.data[0],2]+=1
        #compute bwd integral
        iBwd = -i + mid
        iBwdRight = iBwd - L - 1
        iBwdLeft  = iBwd + L
        xBwd = stream_line[iBwd]

        if iBwdRight >= 0 and iBwdLeft < l:
            xBwdLeft = stream_line[iBwdLeft]
            xBwdRight = stream_line[iBwdRight]
    
            if chkBoundary(xBwdLeft,width,height) and chkBoundary(xBwdRight,width,height):
                IxBwd[0] += (image[xBwdRight.data[1],xBwdRight.data[0],0] - image[xBwdLeft.data[1],xBwdLeft.data[0],0]) / k
                IxBwd[1] += (image[xBwdRight.data[1],xBwdRight.data[0],1] - image[xBwdLeft.data[1],xBwdLeft.data[0],1]) / k
                IxBwd[2] += (image[xBwdRight.data[1],xBwdRight.data[0],2] - image[xBwdLeft.data[1],xBwdLeft.data[0],2]) / k
                out_image[xBwd.data[1],xBwd.data[0],0] += IxBwd[0]
                out_image[xBwd.data[1],xBwd.data[0],1] += IxBwd[1]
                out_image[xBwd.data[1],xBwd.data[0],2] += IxBwd[2]
                num_hits[xBwd.data[1],xBwd.data[0],0]+=1
                num_hits[xBwd.data[1],xBwd.data[0],1]+=1
                num_hits[xBwd.data[1],xBwd.data[0],2]+=1
    return out_image,num_hits


def computeLIC(image,vfield_image):
    height,width,channel = image.shape
    out_image = np.zeros((height,width,channel))
    num_hits = np.zeros((height,width,channel))
    minNumHits = 5
    w2 = int(width / 2)
    h2 = int(height / 2)
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
        if num_hits[p1y,p1x,0] < minNumHits:
            streamLine = computeStreamLine(vfield_image,p1x, p1y)
            out_image,num_hits = computeStreamLines(image,streamLine,out_image,num_hits)
        
        if num_hits[p2y,p2x,0] < minNumHits:
            streamLine = computeStreamLine(vfield_image,p2x, p2y)
            out_image,num_hits = computeStreamLines(image,streamLine,out_image,num_hits)

        if num_hits[p3y,p3x,0] < minNumHits:
            streamLine = computeStreamLine(vfield_image,p3x, p3y)
            out_image,num_hits = computeStreamLines(image,streamLine,out_image,num_hits)

        if num_hits[p4y,p4x,0] < minNumHits:
            streamLine = computeStreamLine(vfield_image,p4x, p4y)
            out_image,num_hits = computeStreamLines(image,streamLine,out_image,num_hits)
            
    for j in range(height):
        for i in range(width):
            for c in range(channel):
                if num_hits[j,i,c] != 0:
                    out_image[j,i,c] /= num_hits[j,i,c]
    
    return out_image

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

kernel_size = 5

img = cv.imread('./img/input.jpg')
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
        vfield_image[j,i,0] = np.cos(theta)
        vfield_image[j,i,1] = np.sin(theta)

print("generated vector field!")

lic_image = computeLIC(img,vfield_image)
cv.imwrite("./img/lic_image.png",lic_image)