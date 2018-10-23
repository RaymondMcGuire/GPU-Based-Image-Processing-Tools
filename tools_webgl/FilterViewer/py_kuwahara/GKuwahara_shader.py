# -*- coding: utf-8 -*-
"""
Created on Sat Sep 29 18:06:00 2018

@author: raymondmg
"""
import numpy as np
def divide_kernel(kernel_size,div):
    rad = kernel_size //2
    angle = 2 * np.pi / div
    
    out = []
    for i in range(div):
        out.append([])
    
    for h in range(-rad,rad+1):
        for w in range(-rad,rad+1):
            theta = np.arctan2(h,w)
            index = int(np.floor(theta/angle) % div)
            out[index].append((h,w))
    return out

def gaussian_kernel(kernel):
    out_kernel = np.zeros((kernel,kernel))
    for i in range(kernel):
        for j in range(kernel):
            out_kernel[i,j] = np.exp(-((i-kernel//2)**2+(j-kernel//2)**2) / (2 * (kernel)**2))
    return out_kernel

g = gaussian_kernel(7)

s="[";
for i in range(len(g)):
    for j in range(len(g[i])):
        s+=str(round(g[i][j],4))+" ,"
s+="]"
print(s)

divRegion = divide_kernel(7,8)


for i in range(len(divRegion)):
    d = divRegion[i]
    print("mean["+str(i)+"]=vec3(0.0);")
    print("sigma["+str(i)+"]=vec3(0.0);")
    print("cur_weight = 0.0;")
    for j in range(len(d)):
        idx = (d[j][0]+3)+(d[j][1]+3)*7
        print("mean["+str(i)+"]  += texture2D(texture, (fc + offset["+str(idx)+"]) * Frag).rgb * weight["+str(idx)+"];")
        print("sigma["+str(i)+"]  += texture2D(texture, (fc + offset["+str(idx)+"]) * Frag).rgb * texture2D(texture, (fc + offset["+str(idx)+"]) * Frag).rgb * weight["+str(idx)+"];")
        print("cur_weight+= weight["+str(idx)+"];")
    print("mean["+str(i)+"] /= cur_weight;")
    print("sigma["+str(i)+"] /= cur_weight;")
    print("cur_std = sqrt(abs(sigma["+str(i)+"] - mean["+str(i)+"] * mean["+str(i)+"]));")
    print("total_ms += mean["+str(i)+"] * pow(cur_std,vec3(-q));")
    print("total_s  += pow(cur_std,vec3(-q));")