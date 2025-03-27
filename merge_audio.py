from pydub import AudioSegment
from pydub.generators import Silence

def merge_audio_with_silence(audio_files, target_duration_ms=600000):  # 默认10分钟 = 600000毫秒
    """
    合并多个音频文件，并在末尾补充静音至指定时长
    
    参数:
        audio_files: 音频文件路径列表
        target_duration_ms: 目标总时长（毫秒）
    
    返回:
        合并后的音频段
    """
    # 创建空的音频段
    combined = AudioSegment.empty()
    
    # 合并所有音频文件
    for file in audio_files:
        try:
            audio = AudioSegment.from_file(file)
            combined += audio
        except Exception as e:
            print(f"处理文件 {file} 时出错: {str(e)}")
            continue
    
    # 计算需要补充的静音时长
    current_length = len(combined)
    if current_length < target_duration_ms:
        silence_duration = target_duration_ms - current_length
        silence = Silence().to_audio_segment(duration=silence_duration)
        combined += silence
    
    return combined

def main():
    # 音频文件列表
    audio_files = [
        "audio1.mp3",  # 替换为你的音频文件路径
        "audio2.mp3",
        "audio3.mp3"
    ]
    
    # 合并音频并添加静音（设置为10分钟）
    result = merge_audio_with_silence(audio_files)
    
    # 导出合并后的文件
    try:
        result.export("merged_output.mp3", format="mp3")
        print("音频合并完成！输出文件：merged_output.mp3")
    except Exception as e:
        print(f"导出文件时出错: {str(e)}")

if __name__ == "__main__":
    main()