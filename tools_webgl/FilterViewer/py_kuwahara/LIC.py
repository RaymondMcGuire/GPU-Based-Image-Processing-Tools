# -*- coding: utf-8 -*-
"""
Created on Thu Oct  4 18:18:06 2018

@author: g-xu-wang
"""

import cv2 as cv
import numpy as np

import SST
import VectorField
import Vector

class LIC:
    def __init__(self,image,vfield,L=20,M=10,h=0.5,offset=0):
        self.image = image
        self.vfield = vfield
        self.L = L
        self.M = M
        self.h = h
        self.offset = offset
        self.height = image.shape[0]
        self.width = image.shape[1]
        self.channel = image.shape[2]
        self.minNumHits = 5
   
    def RK4(self, p, h):
      v = self.vfield.GetVectorFieldValByCoord(p)

      k1 = v.vscale(h)
      
      v = self.vfield.GetVectorFieldValByCoord(p.add(k1.scale(0.5)))
      k2 = v.vscale(h)
      
      v = self.vfield.GetVectorFieldValByCoord(p.add(k2.scale(0.5)))
      k3 = v.vscale(h)
    
      v = self.vfield.GetVectorFieldValByCoord(p.add(k3))
      k4 = v.vscale(h)
      p = p.add(k1.vscale(1/6).vadd(k2.vscale(1/3)).vadd(k3.vscale(1/3)).vadd(k4.vscale(1/6)))
      
      x = p.data[0]
      y = p.data[1]
      if y>= self.height:
        y -= self.height
      if x>=self.width:
          x -=self.width
    
      return Vector.Vector2(x,y)



    def computeStreamLine(self,x,y):
    
      fwd = []
      bwd = []
      f = Vector.Vector2(x, y)
      b = Vector.Vector2(x, y)
    
      for i in range(self.L + self.M -1): 
        f = self.RK4(f,  self.h)
        fwd.append(f)
        
        b = self.RK4(b, -self.h)
        bwd.append(b)
      
      bwd.reverse()
      bwd = bwd + fwd
    
      for i in range(len(bwd)):
          p = bwd[i]
          bwd[i] = p.vint()
    
      return bwd

    def chkBoundary(self,v2):
        return v2.data[0]>=0 and v2.data[1]>=0 and v2.data[0]<self.width and v2.data[1]<self.height
    

    def computeStreamLines(self,stream_line,out_image,num_hits):
        #compute integral for center of streamline
        Ix0 = [0,0,0]
        k = 0
        l = len(stream_line)
        mid = (l // 2) + self.offset
        x0 = stream_line[mid]
        for i in range(-self.L,self.L):
            xi = stream_line[mid + i]
            if self.chkBoundary(xi):
                Ix0[0] += self.image[xi.data[1],xi.data[0],0]
                Ix0[1] += self.image[xi.data[1],xi.data[0],1]
                Ix0[2] += self.image[xi.data[1],xi.data[0],2]
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
        for i in range(1,self.M):
            #compute fwd integral
            iFwd = i + mid
            iFwdRight = iFwd + self.L + 1
            iFwdLeft  = iFwd - self.L
            xFwd = stream_line[iFwd]
            if iFwdLeft >= 0 and iFwdRight < l:
                xFwdLeft = stream_line[iFwdLeft]
                xFwdRight = stream_line[iFwdRight]
                
                if self.chkBoundary(xFwdLeft) and self.chkBoundary(xFwdRight):
                    IxFwd[0] += float(self.image[xFwdRight.data[1],xFwdRight.data[0],0] - self.image[xFwdLeft.data[1],xFwdLeft.data[0],0]) / k
                    IxFwd[1] += float(self.image[xFwdRight.data[1],xFwdRight.data[0],1] - self.image[xFwdLeft.data[1],xFwdLeft.data[0],1]) / k
                    IxFwd[2] += float(self.image[xFwdRight.data[1],xFwdRight.data[0],2] - self.image[xFwdLeft.data[1],xFwdLeft.data[0],2]) / k
                    out_image[xFwd.data[1],xFwd.data[0],0] += IxFwd[0]
                    out_image[xFwd.data[1],xFwd.data[0],1] += IxFwd[1]
                    out_image[xFwd.data[1],xFwd.data[0],2] += IxFwd[2]
                    num_hits[xFwd.data[1],xFwd.data[0],0]+=1
                    num_hits[xFwd.data[1],xFwd.data[0],1]+=1
                    num_hits[xFwd.data[1],xFwd.data[0],2]+=1
            #compute bwd integral
            iBwd = -i + mid
            iBwdRight = iBwd - self.L - 1
            iBwdLeft  = iBwd + self.L
            xBwd = stream_line[iBwd]
    
            if iBwdRight >= 0 and iBwdLeft < l:
                xBwdLeft = stream_line[iBwdLeft]
                xBwdRight = stream_line[iBwdRight]
        
                if self.chkBoundary(xBwdLeft) and self.chkBoundary(xBwdRight):
                    IxBwd[0] += float(self.image[xBwdRight.data[1],xBwdRight.data[0],0] - self.image[xBwdLeft.data[1],xBwdLeft.data[0],0]) / k
                    IxBwd[1] += float(self.image[xBwdRight.data[1],xBwdRight.data[0],1] - self.image[xBwdLeft.data[1],xBwdLeft.data[0],1]) / k
                    IxBwd[2] += float(self.image[xBwdRight.data[1],xBwdRight.data[0],2] - self.image[xBwdLeft.data[1],xBwdLeft.data[0],2]) / k
                    out_image[xBwd.data[1],xBwd.data[0],0] += IxBwd[0]
                    out_image[xBwd.data[1],xBwd.data[0],1] += IxBwd[1]
                    out_image[xBwd.data[1],xBwd.data[0],2] += IxBwd[2]
                    num_hits[xBwd.data[1],xBwd.data[0],0]+=1
                    num_hits[xBwd.data[1],xBwd.data[0],1]+=1
                    num_hits[xBwd.data[1],xBwd.data[0],2]+=1
        return out_image,num_hits


    def computeLIC(self):
        height = self.height
        width = self.width
        channel = self.channel
        out_image = np.zeros((height,width,channel))
        num_hits = np.zeros((height,width,channel))
        minNumHits = self.minNumHits
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
                streamLine = self.computeStreamLine(p1x, p1y)
                out_image,num_hits = self.computeStreamLines(streamLine,out_image,num_hits)
            
            if num_hits[p2y,p2x,0] < minNumHits:
                streamLine = self.computeStreamLine(p2x, p2y)
                out_image,num_hits = self.computeStreamLines(streamLine,out_image,num_hits)
    
            if num_hits[p3y,p3x,0] < minNumHits:
                streamLine = self.computeStreamLine(p3x, p3y)
                out_image,num_hits = self.computeStreamLines(streamLine,out_image,num_hits)
    
            if num_hits[p4y,p4x,0] < minNumHits:
                streamLine = self.computeStreamLine(p4x, p4y)
                out_image,num_hits = self.computeStreamLines(streamLine,out_image,num_hits)
                
        for j in range(height):
            for i in range(width):
                for c in range(channel):
                    if num_hits[j,i,c] != 0:
                        out_image[j,i,c] /= num_hits[j,i,c]
        
        return out_image

img = cv.imread('./img/building.png')
sst_func = SST.SST(img,SST.SST_TYPE.CLASSIC)
sst_image = sst_func.cal()

vfield_func = VectorField.VectorField(sst_image)
vfield_image = vfield_func.cal()

lic_func = LIC(img,vfield_func)
lic_image = lic_func.computeLIC()
cv.imwrite("./img/lic_image.png",lic_image)