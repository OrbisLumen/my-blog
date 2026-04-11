---
title: pvz-for-learning
published: 2025-12-22
description: The start of my cs journey
tags: ["CS", "OrbisLumen","cpp","c","project","UESTC"]
category: CS
draft: false
---

## Note
This is a cpp program using visual studio

::github{repo="OrbisLumen/pvz-for-learning"}

## Introduction
This is my very first cpp project.<br>

To say honestly, it's just a homework for my college course `Fundamentals of Programming and Algorithms Ⅰ` in the first year in UESTC.<br> 

By the way, we are required to finish this hw in corporation. However, as a freshmen both in college and in the field of software engineering, I haven't learned that team collabration is very important.<br>

 As a result, I finish this by myself while watching the [videos](https://www.bilibili.com/video/BV1vM4y1X7Kb/) by [rock](https://space.bilibili.com/485705286).

## Self-thinking
For first project, I think it is okay.<br>
It can be seen as `the start of my cs journey`

## Content
    knowledge
1. basic knowledge of cpp
2. process control
3. function calls

## Update Log
1.	change all the sunshine animation control from integer to float for smoother animation

2.	change sunshine ball animation implementation model from offsite to bezier curve
	abandon unnecessary sunshineball struct menbers (x,y,xoff,yoff,destY)

3.	change sound playing method several times,finally use the method alias

4.	fix there is a ghost image in last mouse clicking position when dragging plants from banner
	(need to update msg.x and msg.y when left button down in the function "userClick()")

5.	fix only one Peashooter shoot if increase createZombies frequency
	(add shootTimer for every plants instead of using one "count" for all)

6.	change when to minus sunshine

7.	add most audio by PlaySoundAsync

8.	add zombies eating sound by PlaySound,
	also by adding soundFlag and soundCount to zombie struct to control

9.	add eatingfre to zombie struct to slow zombies eating animation

10.	fix when you win the game,but the zombies are still created 
	(this is actually a variable conflict,the global zmCount meet the static zmCount)
	now change the global zmCount to zmCnt

11.	adjust zombies create frequency
	if (zmCnt <= ZM_MAX * 0.15) {zmFre = 600;}
	else if (zmCnt <= ZM_MAX * 0.75) {zmFre = rand() % 200 + 100;}
	else {zmFre = 10;}
