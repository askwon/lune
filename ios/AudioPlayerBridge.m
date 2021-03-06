
//
//  AudioPlayerBridge.m
//  Lune
//
//  Created by Andrew Kwon on 4/3/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

/**
 *  AudioPlayerBridge - Expose AudioPlayer to React Native
 */

#import "RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(AudioPlayer, NSObject)

RCT_EXTERN_METHOD(initPlaylist:(NSString *)name audioURIs:(NSArray *)audioURIs)
RCT_EXTERN_METHOD(addToPlaylist:(NSString *)name audioURIs:(NSArray *)audioURIs)
RCT_EXTERN_METHOD(play:(NSString *)name index:(int)index)
RCT_EXTERN_METHOD(pause)
RCT_EXTERN_METHOD(seek:(int *)seconds)

@end

@interface RCT_EXTERN_MODULE(Tumblr, NSObject)

RCT_EXTERN_METHOD(authenticate:(RCTResponseSenderBlock)callback)

@end
