import onnxruntime as ort
import numpy as np
import cv2
from PIL import Image

class YOLOInference:
    def __init__(self, model_path, conf_thres=0.25, iou_thres=0.45):
        self.session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
        self.input_name = self.session.get_inputs()[0].name
        self.output_names = [x.name for x in self.session.get_outputs()]
        self.input_shape = self.session.get_inputs()[0].shape
        self.img_size = self.input_shape[2:] # (h, w)
        self.conf_thres = conf_thres
        self.iou_thres = iou_thres

    def preprocess(self, image: Image.Image):
        # Resize and pad
        img = np.array(image)
        h, w = img.shape[:2]
        scale = min(self.img_size[0] / h, self.img_size[1] / w)
        new_h, new_w = int(h * scale), int(w * scale)
        img_resized = cv2.resize(img, (new_w, new_h))
        
        # Pad
        pad_h = (self.img_size[0] - new_h) / 2
        pad_w = (self.img_size[1] - new_w) / 2
        top, bottom = int(round(pad_h - 0.1)), int(round(pad_h + 0.1))
        left, right = int(round(pad_w - 0.1)), int(round(pad_w + 0.1))
        img_padded = cv2.copyMakeBorder(img_resized, top, bottom, left, right, cv2.BORDER_CONSTANT, value=(114, 114, 114))
        
        # Normalize
        img_in = img_padded.transpose((2, 0, 1))[::-1]  # HWC to CHW, BGR to RGB
        img_in = np.ascontiguousarray(img_in)
        img_in = img_in.astype(np.float32)
        img_in /= 255.0
        img_in = img_in[None] # Add batch dimension
        
        return img_in, scale, (pad_w, pad_h)

    def infer(self, image: Image.Image):
        img_in, scale, pad = self.preprocess(image)
        outputs = self.session.run(self.output_names, {self.input_name: img_in})
        
        # YOLOv8/11 output shape: (1, 84, 8400) -> (Batch, 4+Classes, Anchors)
        # We need to transpose to (Batch, Anchors, 4+Classes)
        output = outputs[0].transpose(0, 2, 1)
        
        boxes, scores, class_ids = self.postprocess(output, scale, pad)
        return boxes, scores, class_ids

    def postprocess(self, output, scale, pad):
        predictions = np.squeeze(output) # (8400, 84)
        
        # Filter by confidence
        scores = np.max(predictions[:, 4:], axis=1)
        mask = scores > self.conf_thres
        predictions = predictions[mask]
        scores = scores[mask]
        class_ids = np.argmax(predictions[:, 4:], axis=1)
        
        if len(predictions) == 0:
            return [], [], []

        # Extract boxes
        boxes = predictions[:, :4]
        
        # xywh to xyxy
        boxes_xyxy = np.copy(boxes)
        boxes_xyxy[:, 0] = boxes[:, 0] - boxes[:, 2] / 2
        boxes_xyxy[:, 1] = boxes[:, 1] - boxes[:, 3] / 2
        boxes_xyxy[:, 2] = boxes[:, 0] + boxes[:, 2] / 2
        boxes_xyxy[:, 3] = boxes[:, 1] + boxes[:, 3] / 2
        
        # Rescale boxes to original image
        boxes_xyxy[:, [0, 2]] -= pad[0]
        boxes_xyxy[:, [1, 3]] -= pad[1]
        boxes_xyxy[:, :4] /= scale
        
        # NMS
        indices = cv2.dnn.NMSBoxes(boxes_xyxy.tolist(), scores.tolist(), self.conf_thres, self.iou_thres)
        
        if len(indices) > 0:
            indices = indices.flatten()
            return boxes_xyxy[indices], scores[indices], class_ids[indices]
        else:
            return [], [], []

import sys
import os

def get_resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    # Use the directory of the current script as the base path
    base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path.lstrip("backend/"))

# Singleton instance
model = YOLOInference(get_resource_path("backend/models/best.onnx"))
